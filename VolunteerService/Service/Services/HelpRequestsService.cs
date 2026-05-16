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
    
    public class HelpRequestsService : IService<HelpRequestsDto>
    {

        private readonly IRepository<HelpRequests> _repository;
        private readonly IMapper _mapper;
        private readonly AIService _aiService;

        // רפוזיטורי לטבלת Categories — נדרש ל-AddHelpRequestWithAI לבדיקה/יצירה של קטגוריה
        private readonly IRepository<Categories> _categoryRepository;

        // הזרקת תלויות דרך הקונסטרקטור
        // שים לב: AIService נוצר ישירות עם new ולא מוזרק — לא אידיאלי לטסטים אבל עובד
        public HelpRequestsService(
            IRepository<HelpRequests> repository,
            IMapper mapper,
            IRepository<Categories> categoryRepository
        )
        {
            _repository = repository;
            _mapper = mapper;
            _aiService = new AIService();
            _categoryRepository = categoryRepository;
        }

        // שליפת כל בקשות העזרה
        public async Task<List<HelpRequestsDto>> GetAll()
            => _mapper.Map<List<HelpRequestsDto>>(await _repository.GetAll());

        // שליפת בקשת עזרה בודדת לפי מזהה
        public async Task<HelpRequestsDto> GetById(int id)
            => _mapper.Map<HelpRequestsDto>(await _repository.GetById(id));

        // הוספת בקשת עזרה פשוטה — ללא AI, ללא סיווג אוטומטי
        // CreatedAt מוגדר בשרת לרגע הנוכחי — לא סומכים על ה-client
        public async Task<HelpRequestsDto> AddItem(HelpRequestsDto item)
        {
            item.CreatedAt = DateTime.Now;
            var entity = _mapper.Map<HelpRequests>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<HelpRequestsDto>(added);
        }

        // הוספת בקשת עזרה עם סיווג AI אוטומטי — הנתיב הראשי מהאפליקציה
        // הזרימה: קבלת הבקשה → שליחה ל-AI → מציאת/יצירת קטגוריה → שמירה עם Availability
        public async Task<HelpRequestsDto> AddHelpRequestWithAI(HelpRequestsDto item)
        {
            item.CreatedAt = DateTime.Now;

            // שלב 1: שליחת הטקסט ל-AI לקבלת קטגוריה ואייקון מוצעים
            var aiResult = await _aiService.GetCategoryFromAI(item.Description);
            var categoryName = aiResult.category;
            var icon = aiResult.icon;

            // שלב 2: בדיקה אם הקטגוריה שה-AI החזיר כבר קיימת במסד הנתונים
            // אם לא קיימת — יוצרים אותה אוטומטית (מונע כפילויות ידניות)
            var categories = await _categoryRepository.GetAll();
            var existingCategory = categories.FirstOrDefault(c => c.Name == categoryName);

            if (existingCategory == null)
            {
                // יצירת קטגוריה חדשה על בסיס תשובת ה-AI
                // אם ה-AI החזיר שם ריק — נותנים "Uncategorized" כברירת מחדל
                existingCategory = new Categories
                {
                    Name = string.IsNullOrWhiteSpace(categoryName) ? "Uncategorized" : categoryName,
                    Description = categoryName,
                    Icon = icon
                };
                await _categoryRepository.AddItem(existingCategory);
            }

            // שלב 3: המרת ה-DTO ל-entity עם CategoryID שנמצא/נוצר
            var entity = _mapper.Map<HelpRequests>(item);
            entity.CategoryID = existingCategory.Id;

            // שלב 4: טיפול מיוחד ב-Availability — AutoMapper לפעמים לא ממפה nested objects
            // אם ה-DTO מכיל Availability אבל ה-entity יצא ריק — בונים אותו ידנית
            if (item.Availability != null && entity.Availability == null)
            {
                entity.Availability = new Availabilities
                {
                    UserID = item.Availability.UserID,
                    Day = item.Availability.Day,
                    From_Time = item.Availability.From_Time,
                    To_Time = item.Availability.To_Time
                };
            }

            // שלב 5: שמירה — הרפוזיטורי אחראי גם על שמירת ה-Availability המקונן
            var added = await _repository.AddItem(entity);

            return _mapper.Map<HelpRequestsDto>(added);
        }

        // עדכון בקשת עזרה קיימת לפי מזהה
        // מטפל בנפרד בשדות פשוטים ובאובייקט ה-Availability המקונן
        public async Task UpdateItem(int id, HelpRequestsDto item)
        {
            // שליפת הבקשה הקיימת כולל Availability
            var existing = await _repository.GetById(id);
            if (existing == null)
                throw new Exception("HelpRequest not found");

            // עדכון שדות פשוטים אחד-אחד (לא AutoMapper) — בטוח יותר עבור שדות קריטיים
            existing.NeedyID = item.NeedyID;
            existing.CategoryID = item.CategoryID;
            existing.Description = item.Description;
            existing.Status = item.Status;
            existing.CreatedAt = item.CreatedAt;

            // טיפול ב-Availability — שלושה מקרים אפשריים:
            if (item.Availability != null)
            {
                if (existing.Availability == null)
                {
                    // מקרה 1: לא הייתה Availability — יוצרים חדשה
                    existing.Availability = new Availabilities
                    {
                        UserID = item.Availability.UserID,
                        Day = item.Availability.Day,
                        From_Time = item.Availability.From_Time,
                        To_Time = item.Availability.To_Time
                    };
                }
                else
                {
                    // מקרה 2: כבר קיימת Availability — מעדכנים את השדות בתוך האובייקט הקיים
                    // (לא יוצרים חדש — שומרים על אותו ID בטבלת Availabilities)
                    existing.Availability.UserID = item.Availability.UserID;
                    existing.Availability.Day = item.Availability.Day;
                    existing.Availability.From_Time = item.Availability.From_Time;
                    existing.Availability.To_Time = item.Availability.To_Time;
                }
            }
            else if (existing.Availability != null)
            {
                // מקרה 3: ה-DTO לא מכיל Availability אבל הקיים כן — מוחקים
                // שימוש ב-DeleteItem של הרפוזיטורי לניקוי ה-row מטבלת Availabilities
                _repository.DeleteItem(existing.Availability.Id);
                existing.Availability = null;
            }

            await _repository.UpdateItem(id, existing);
        }

        // מחיקת בקשת עזרה לפי מזהה
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // שליפת בקשות עזרה לפי סטטוס (Open / Matched / Completed / Cancelled)
        // משמש לאלגוריתם השידוך שמחפש רק בקשות Open
        public async Task<List<HelpRequestsDto>> GetHelpRequestsByStatus(HelpRequestStatus status)
        {
            var entities = await _repository.Find(status.ToString());
            return _mapper.Map<List<HelpRequestsDto>>(entities);
        }
    }
}


