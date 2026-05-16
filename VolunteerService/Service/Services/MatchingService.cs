using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Services
{
    // אובייקט תוצאה שמחזירים אחרי השיבוץ
    public class MatchResult
    {
        public int HelpRequestId { get; set; }      // מזהה בקשת העזרה
        public int NeedyId { get; set; }            // מזהה הנזקק
        public string NeedyName { get; set; }       // שם הנזקק
        public int VolunteerId { get; set; }        // מזהה מתנדב
        public string VolunteerName { get; set; }   // שם מתנדב
        public double DistanceKm { get; set; }      // מרחק בין הצדדים
        public double Score { get; set; }           // ציון התאמה (מרחק + זמן)
        public string MatchedDay { get; set; }      // יום ההתאמה
        public string TimeFrom { get; set; }        // שעת התחלה
        public string TimeTo { get; set; }          // שעת סיום
        public string CategoryName { get; set; }    // קטגוריה
    }

    public class MatchingService
    {
        // רפוזיטוריז לכל הנתונים הנדרשים לאלגוריתם
        private readonly IRepository<HelpRequests> _helpRequestsRepo;
        private readonly IRepository<Users> _usersRepo;
        private readonly IRepository<Availabilities> _availabilitiesRepo;
        private readonly IRepository<UserAvailabilities> _userAvailabilitiesRepo;
        private readonly IRepository<UserCategories> _userCategoriesRepo;
        private readonly IRepository<Categories> _categoriesRepo;
        private readonly IRepository<Assignments> _assignmentsRepo;

        // מרחק מקסימלי מותר לשידוך
        private const double MAX_DISTANCE_KM = 30.0;

        // קונסטרקטור
        public MatchingService(
            IRepository<HelpRequests> helpRequestsRepo,
            IRepository<Users> usersRepo,
            IRepository<Availabilities> availabilitiesRepo,
            IRepository<UserAvailabilities> userAvailabilitiesRepo,
            IRepository<UserCategories> userCategoriesRepo,
            IRepository<Categories> categoriesRepo,
            IRepository<Assignments> assignmentsRepo)
        {
            _helpRequestsRepo = helpRequestsRepo;
            _usersRepo = usersRepo;
            _availabilitiesRepo = availabilitiesRepo;
            _userAvailabilitiesRepo = userAvailabilitiesRepo;
            _userCategoriesRepo = userCategoriesRepo;
            _categoriesRepo = categoriesRepo;
            _assignmentsRepo = assignmentsRepo;
        }

        // לבדיקה-לא קשור ללוגיקה
        private void Log(string message)
        {
            File.AppendAllText("matching.log", $"{DateTime.Now:HH:mm:ss.fff} - {message}\n");
        }

        // קשת בגרף: מתנדב + סלוט + ציון התאמה-הרכבת שבוץ:ממתנדב+זמינות+אחוזי התאמה
        private class Edge
        {
            public int VolunteerId { get; set; }
            public int SlotId { get; set; }
            public double Score { get; set; }
        }

        // =========================================================
        // פונקציית DFS למציאת נתיב הגדלה (Augmenting Path)
        // זה הלב של האלגוריתם למקסימום שידוכים
        // =========================================================
        private bool TryAugment(
            int reqId,   // בקשת עזרה
            Dictionary<int, List<Edge>> graph, // גרף: בקשה → אפשרויות שיבוץ
            Dictionary<(int volId, int slotId), int> slotToReq, // סלוט → בקשה
            Dictionary<int, (int volId, int slotId)> reqToSlot, // בקשה → סלוט
            HashSet<(int volId, int slotId)> visited) // למניעת לולאות
        {
            // אם אין לבקשה קשתות → אין מה לשבץ
            if (!graph.ContainsKey(reqId)) return false;

            // עוברים על כל האפשרויות לפי ציון מהגבוה לנמוך
            foreach (var edge in graph[reqId].OrderByDescending(e => e.Score))
            {
                var key = (edge.VolunteerId, edge.SlotId);

                // אם כבר ניסינו את הסלוט הזה → דלג
                if (visited.Contains(key)) continue;
                visited.Add(key);

                // בדיקה אם הסלוט פנוי
                bool slotFree = !slotToReq.ContainsKey(key);

                // אם לא פנוי → ננסה להזיז את הבקשה שתופסת אותו (רקורסיה!)
                bool canAugment = slotFree ||
                    TryAugment(slotToReq[key], graph, slotToReq, reqToSlot, visited);

                if (canAugment)
                {
                    // אם הסלוט היה תפוס → נבטל את השיבוץ הקודם
                    if (slotToReq.ContainsKey(key))
                        reqToSlot.Remove(slotToReq[key]);

                    // נבצע שיבוץ חדש
                    slotToReq[key] = reqId;
                    reqToSlot[reqId] = key;

                    return true;
                }
            }

            return false;
        }

        // =========================================================
        // הפונקציה הראשית שמבצעת את כל השיבוץ
        // =========================================================
        public async Task<List<MatchResult>> MatchAll()
        {
            Log("MATCHING STARTED");

            // שליפת בקשות פתוחות בלבד
            var helpRequests = (await _helpRequestsRepo.GetAll())
                .Where(r => r.Status == HelpRequestStatus.Open)
                .ToList();

            // שליפת כל הנתונים הדרושים
            var users = await _usersRepo.GetAll();
            var volunteers = users.Where(u => u.UserRole == UserRole.Volunteer).ToList();
            var availabilities = await _availabilitiesRepo.GetAll();
            var userAvailabilities = await _userAvailabilitiesRepo.GetAll();
            var userCategories = await _userCategoriesRepo.GetAll();
            var categories = await _categoriesRepo.GetAll();

            // =====================================================
            // שליפת שיבוצים קיימים (כדי לא לשבץ שוב)
            // =====================================================
            var existingAssignments = await _assignmentsRepo.GetAll();

            // בקשות שכבר שובצו
            var alreadyMatchedRequestIds = existingAssignments
                .Where(a => a.Status == AssignmentStatus.Active)
                .Select(a => a.HelpRequestID)
                .ToHashSet();

            // סלוטים תפוסים של מתנדבים
            var busyVolunteerSlots = new HashSet<(int volId, int slotId)>();
            //המטרה:עבור כל שיבוץ חוסם למתנדב את כל הזמינויות שתפוסות לו ע"י השיבוץ
            foreach (var assignment in existingAssignments.Where(a => a.Status == AssignmentStatus.Active))
            {
                // מוצאים את הבקשה המשויכת
                var matchedReq = (await _helpRequestsRepo.GetAll())
                    .FirstOrDefault(r => r.Id == assignment.HelpRequestID);

                if (matchedReq?.Availability == null) continue;

                // כל הסלוטים של המתנדב
                var volSlotIds = userAvailabilities
                    .Where(ua => ua.UserID == assignment.VolunteerID)
                    .Select(ua => ua.AvailabilityID)
                    .ToHashSet();

                // מוצאים סלוטים חופפים בזמן → חוסמים אותם
                var overlappingSlots = availabilities
                    .Where(a =>
                        volSlotIds.Contains(a.Id) &&
                        a.Day == matchedReq.Availability.Day &&
                        a.From_Time < matchedReq.Availability.To_Time &&
                        a.To_Time > matchedReq.Availability.From_Time)
                    .Select(a => a.Id);

                foreach (var slotId in overlappingSlots)
                    busyVolunteerSlots.Add((assignment.VolunteerID, slotId));
            }

            // =====================================================
            // בניית גרף דו-חלקי (בקשות ↔ סלוטים של מתנדבים)
            // =====================================================
            var graph = new Dictionary<int, List<Edge>>();

            // שמירת מידע נוסף לכל סלוט (לשלב התוצאה)
            var slotMeta = new Dictionary<(int volId, int slotId), (Users vol, Availabilities slot, double dist)>();

            foreach (var req in helpRequests)
            {
                // דילוג על בקשות שכבר שובצו
                if (alreadyMatchedRequestIds.Contains(req.Id)) continue;

                var needy = users.FirstOrDefault(u => u.Id == req.NeedyID);
                if (needy == null || req.Availability == null) continue;

                var edges = new List<Edge>();

                foreach (var vol in volunteers)
                {
                    // בדיקת התאמת קטגוריה
                    var volCategories = userCategories
                        .Where(c => c.UserID == vol.Id)
                        .Select(c => c.CategoryID)
                        .ToHashSet();

                    if (!volCategories.Contains(req.CategoryID)) continue;

                    // שליפת זמינויות של המתנדב
                    var volSlotIds = userAvailabilities
                        .Where(ua => ua.UserID == vol.Id)
                        .Select(ua => ua.AvailabilityID)
                        .ToHashSet();

                    var volSlots = availabilities
                        .Where(a => volSlotIds.Contains(a.Id))
                        .ToList();

                    foreach (var slot in volSlots)
                    {
                        // התאמה ביום
                        if (slot.Day != req.Availability.Day) continue;

                        // בדיקת חפיפה בשעות
                        if (slot.From_Time > req.Availability.To_Time ||
                            slot.To_Time < req.Availability.From_Time) continue;

                        // בדיקה אם הסלוט תפוס
                        if (busyVolunteerSlots.Contains((vol.Id, slot.Id))) continue;

                        // חישוב מרחק גיאוגרפי
                        double dist = HaversineKm(
                            needy.Latitude, needy.Longitude,
                            vol.Latitude, vol.Longitude);

                        if (dist > MAX_DISTANCE_KM) continue;

                        // חישוב ציון: מרחק + חפיפת זמן
                        double distScore = 1.0 - (dist / MAX_DISTANCE_KM);
                        double overlapScore = TimeOverlapScore(req.Availability, slot);
                        double totalScore = distScore + overlapScore;

                        edges.Add(new Edge
                        {
                            VolunteerId = vol.Id,
                            SlotId = slot.Id,
                            Score = totalScore
                        });

                        slotMeta.TryAdd((vol.Id, slot.Id), (vol, slot, dist));
                    }
                }

                if (edges.Any())
                    graph[req.Id] = edges;
            }

            // =====================================================
            // הפעלת האלגוריתם למציאת שיבוץ מקסימלי
            // =====================================================
            var slotToReq = new Dictionary<(int, int), int>();
            var reqToSlot = new Dictionary<int, (int, int)>();

            foreach (var reqId in graph.Keys.OrderBy(k => graph[k].Count))
            {
                var visited = new HashSet<(int, int)>();
                TryAugment(reqId, graph, slotToReq, reqToSlot, visited);
            }

            // =====================================================
            // שמירת תוצאות למסד נתונים + בניית פלט
            // =====================================================
            var results = new List<MatchResult>();

            foreach (var kvp in reqToSlot)
            {
                int reqId = kvp.Key;
                var (volId, slotId) = kvp.Value;

                var req = helpRequests.First(r => r.Id == reqId);
                var (vol, slot, dist) = slotMeta[(volId, slotId)];
                var score = graph[reqId].First(e => e.VolunteerId == volId && e.SlotId == slotId).Score;

                // יצירת Assignment (שיבוץ)
                await _assignmentsRepo.AddItem(new Assignments
                {
                    HelpRequestID = req.Id,
                    VolunteerID = volId,
                    AssignedAt = DateTime.Now,
                    Status = AssignmentStatus.Active
                });

                // עדכון סטטוס הבקשה
                req.Status = HelpRequestStatus.Matched;
                await _helpRequestsRepo.UpdateItem(req.Id, req);

                var category = categories.FirstOrDefault(c => c.Id == req.CategoryID);
                var needyUser = users.First(u => u.Id == req.NeedyID);

                // יצירת אובייקט תוצאה
                results.Add(new MatchResult
                {
                    HelpRequestId = req.Id,
                    NeedyId = req.NeedyID,
                    NeedyName = needyUser.FullName,
                    VolunteerId = volId,
                    VolunteerName = vol.FullName,
                    DistanceKm = Math.Round(dist, 2),
                    Score = Math.Round(score, 3),
                    MatchedDay = slot.Day.ToString(),
                    TimeFrom = slot.From_Time.ToString(@"hh\:mm\:ss"),
                    TimeTo = slot.To_Time.ToString(@"hh\:mm\:ss"),
                    CategoryName = category?.Name ?? "Unknown"
                });
            }

            Log($"MATCHING FINISHED — {results.Count} matches out of {helpRequests.Count} requests");
            return results;
        }

        // חישוב מרחק בין שתי נקודות (נוסחת Haversine)
        private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;

            double dLat = ToRad(lat2 - lat1);
            double dLon = ToRad(lon2 - lon1);

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        // המרה לרדיאנים
        private static double ToRad(double deg) => deg * Math.PI / 180;

        // חישוב כמה אחוז מהזמן חופף בין בקשה למתנדב
        private static double TimeOverlapScore(Availabilities request, Availabilities volunteer)
        {
            var start = request.From_Time > volunteer.From_Time ? request.From_Time : volunteer.From_Time;
            var end = request.To_Time < volunteer.To_Time ? request.To_Time : volunteer.To_Time;

            if (end <= start) return 0;

            double overlap = (end - start).TotalMinutes;
            double requestMinutes = (request.To_Time - request.From_Time).TotalMinutes;

            return requestMinutes > 0 ? overlap / requestMinutes : 0;
        }
    }
}