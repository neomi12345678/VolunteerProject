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
    public class ChatMessagesService : IService<ChatMessagesDto>
    {
       
        private readonly IRepository<ChatMessages> _repository;
        private readonly IMapper _mapper;

        // הזרקת תלויות דרך הקונסטרקטור
        public ChatMessagesService(IRepository<ChatMessages> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // שליפת כל ההודעות ממסד הנתונים
        public async Task<List<ChatMessagesDto>> GetAll()
            => _mapper.Map<List<ChatMessagesDto>>(await _repository.GetAll());

        // שליפת הודעה בודדת לפי מזהה
        public async Task<ChatMessagesDto> GetById(int id)
            => _mapper.Map<ChatMessagesDto>(await _repository.GetById(id));

        // שמירת הודעה חדשה
        // Timestamp מוגדר תמיד בשרת לרגע הנוכחי — לא סומכים על הזמן שנשלח מה-client
        // (מונע זיוף זמן הודעות)
        public async Task<ChatMessagesDto> AddItem(ChatMessagesDto item)
        {
            item.Timestamp = DateTime.Now;
            var entity = _mapper.Map<ChatMessages>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<ChatMessagesDto>(added);
        }

        // עדכון הודעה קיימת לפי מזהה
        // שולף קודם את ה-entity הקיים ומעדכן אותו — שומר על שדות שלא השתנו
        public async Task UpdateItem(int id, ChatMessagesDto item)
        {
            var existing = await _repository.GetById(id);
            if (existing != null)
            {
                _mapper.Map(item, existing);
                await _repository.UpdateItem(id, existing);
            }
        }

        // מחיקת הודעה לפי מזהה
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // שליפת כל ההודעות של שידוך ספציפי לפי AssignmentID
        // זו השאילתה העיקרית שה-ChatPage קורא לה בכל polling (כל 4 שניות)
        // מחזירה את ההודעות לפי סדר קיומן ב-DB (ללא מיון מפורש — מסד הנתונים מחזיר לפי הוספה)
        public async Task<List<ChatMessagesDto>> GetMessagesByAssignment(int assignmentId)
        {
            var entities = (await _repository.GetAll())
                .Where(m => m.AssignmentID == assignmentId)
                .ToList();
            return _mapper.Map<List<ChatMessagesDto>>(entities);
        }
    }
}
