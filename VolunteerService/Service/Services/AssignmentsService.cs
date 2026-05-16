using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Services
{
    public class AssignmentsService : IService<AssignmentsDto>
    {
        // רפוזיטורי לגישה לטבלת Assignments במסד הנתונים
        private readonly IRepository<Assignments> _repository;

        // AutoMapper — לממפה בין Entities ל-DTOs ובחזרה
        private readonly IMapper _mapper;

        // הזרקת תלויות דרך הקונסטרקטור (Dependency Injection)
        public AssignmentsService(IRepository<Assignments> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // שליפת כל השידוכים ממסד הנתונים וממיפה אותם ל-DTOs
        public async Task<List<AssignmentsDto>> GetAll()
            => _mapper.Map<List<AssignmentsDto>>(await _repository.GetAll());

        // שליפת שידוך בודד לפי מזהה
        public async Task<AssignmentsDto> GetById(int id)
            => _mapper.Map<AssignmentsDto>(await _repository.GetById(id));

        // יצירת שידוך חדש
        public async Task<AssignmentsDto> AddItem(AssignmentsDto item)
        {
            var entity = _mapper.Map<Assignments>(item);
            entity.AssignedAt = DateTime.Now;
            entity.Status = AssignmentStatus.Active;
            var added = await _repository.AddItem(entity);
            return _mapper.Map<AssignmentsDto>(added);
        }

        // עדכון שידוך קיים לפי מזהה
        // שולף את ה-entity הקיים ואז ממפה אליו את השינויים — שומר על שדות שלא נשלחו ב-DTO
        public async Task UpdateItem(int id, AssignmentsDto item)
        {
            var existing = await _repository.GetById(id);
            if (existing != null)
            {
                _mapper.Map(item, existing);
                await _repository.UpdateItem(id, existing);
            }
        }

        // מחיקת שידוך לפי מזהה
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // שליפת כל השידוכים של מתנדב ספציפי לפי VolunteerID
        // משמש לעמוד הבית של המתנדב להצגת המשימות שלו
        public async Task<List<AssignmentsDto>> GetAssignmentsByVolunteer(int volunteerId)
        {
            var entities = (await _repository.GetAll())
                .Where(a => a.VolunteerID == volunteerId)
                .ToList();
            return _mapper.Map<List<AssignmentsDto>>(entities);
        }

        // שליפת שידוכים לפי סטטוס (Active / Finished / Cancelled)
        // משתמש ב-Find הגנרי של הרפוזיטורי עם מחרוזת הסטטוס
        public async Task<List<AssignmentsDto>> GetAssignmentsByStatus(AssignmentStatus status)
        {
            var entities = await _repository.Find(status.ToString());
            return _mapper.Map<List<AssignmentsDto>>(entities);
        }

        // סיום שידוך — מעביר סטטוס ל-Finished
        // נקרא כשהמנהל מאשר שסיים לעזור
        public async Task CompleteAssignment(int id)
        {
            var entity = await _repository.GetById(id);
            if (entity != null)
            {
                entity.Status = AssignmentStatus.Finished;
                await _repository.UpdateItem(id, entity);
            }
        }

        // ביטול שידוך — מעביר סטטוס ל-Cancelled
        // נקרא כשמתנדב או נזקק מבטלים את הפגישה
        public async Task CancelAssignment(int id)
        {
            var entity = await _repository.GetById(id);
            if (entity != null)
            {
                entity.Status = AssignmentStatus.Cancelled;
                await _repository.UpdateItem(id, entity);
            }
        }

        // ספירת מספר האנשים שהמתנדב עזר להם בפועל
        // סופר רק שידוכים שהסתיימו (Finished) — לא פעילים ולא מבוטלים
        // משמש להצגת "People Helped" בסטטיסטיקות עמוד הבית של המתנדב
        public async Task<int> GetHelpedCountByVolunteer(int volunteerId)
        {
            var allAssignments = await _repository.GetAll();

            // סופרים רק את המשימות שהסטטוס שלהן Finished
            var finishedCount = allAssignments
                                .Where(a => a.VolunteerID == volunteerId && a.Status == AssignmentStatus.Finished)
                                .Count();

            return finishedCount;
        }

    }
}
