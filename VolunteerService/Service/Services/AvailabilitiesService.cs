using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Services
{
    public class AvailabilitiesService : IService<AvailabilitiesDto>
    {
        // רפוזיטורי לגישה לטבלת Availabilities במסד הנתונים
        private readonly IRepository<Availabilities> _repository;

        // AutoMapper — לממפה בין Entities ל-DTOs
        private readonly IMapper _mapper;

        // הזרקת תלויות דרך הקונסטרקטור
        public AvailabilitiesService(IRepository<Availabilities> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // שליפת כל הזמינויות ממסד הנתונים
        public async Task<List<AvailabilitiesDto>> GetAll()
            => _mapper.Map<List<AvailabilitiesDto>>(await _repository.GetAll());

        // שליפת זמינות בודדת לפי מזהה
        public async Task<AvailabilitiesDto> GetById(int id)
            => _mapper.Map<AvailabilitiesDto>(await _repository.GetById(id));

        // הוספת זמינות חדשה
        // ממיר ה-DTO ל-entity, שומר, ומחזיר את ה-DTO עם ה-ID שנוצר
        public async Task<AvailabilitiesDto> AddItem(AvailabilitiesDto item)
        {
            var entity = _mapper.Map<Availabilities>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<AvailabilitiesDto>(added);
        }

        // עדכון זמינות קיימת לפי מזהה
        // שולף קודם את ה-entity הקיים — מונע דריסה של שדות שלא נשלחו
        public async Task UpdateItem(int id, AvailabilitiesDto item)
        {
            var existing = await _repository.GetById(id);
            if (existing != null)
            {
                _mapper.Map(item, existing);
                await _repository.UpdateItem(id, existing);
            }
        }

        // מחיקת זמינות לפי מזהה
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // שליפת זמינויות לפי יום בשבוע (DAY enum)
        // משמש באלגוריתם השידוך לסינון זמינויות שחופפות ליום של הבקשה
        public async Task<List<AvailabilitiesDto>> GetAvailabilitiesByDay(DAY day)
        {
            var entities = (await _repository.GetAll())
                .Where(a => a.Day == day)
                .ToList();
            return _mapper.Map<List<AvailabilitiesDto>>(entities);
        }

        // שליפת כל הזמינויות של משתמש ספציפי לפי UserID
        // משמש בעמוד לוח הזמנים של המתנדב להצגת הסלוטים שהגדיר
        public async Task<List<AvailabilitiesDto>> GetAvailabilitiesByUserId(int userId)
        {
            var entities = (await _repository.GetAll())
                .Where(a => a.UserID == userId)
                .ToList();

            return _mapper.Map<List<AvailabilitiesDto>>(entities);
        }

    }
}