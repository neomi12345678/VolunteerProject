using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Services
{
    
    public class CategoriesService : IService<CategoriesDto>
    {
        private readonly IRepository<Categories> _repository;    
        private readonly IRepository<UserCategories> _userCategoriesRepository;
        private readonly IMapper _mapper;

        // הזרקת תלויות דרך הקונסטרקטור — כולל שני רפוזיטוריים
        public CategoriesService(IRepository<Categories> repository,
                         IRepository<UserCategories> userCategoriesRepository,
                         IMapper mapper)
        {
            _repository = repository;
            _userCategoriesRepository = userCategoriesRepository;
            _mapper = mapper;
        }

        // שליפת כל הקטגוריות
        public async Task<List<CategoriesDto>> GetAll()
            => _mapper.Map<List<CategoriesDto>>(await _repository.GetAll());

        // שליפת קטגוריה בודדת לפי מזהה
        public async Task<CategoriesDto> GetById(int id)
            => _mapper.Map<CategoriesDto>(await _repository.GetById(id));

        // הוספת קטגוריה חדשה
        public async Task<CategoriesDto> AddItem(CategoriesDto item)
        {
            var entity = _mapper.Map<Categories>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<CategoriesDto>(added);
        }

        // עדכון קטגוריה קיימת לפי מזהה
        public async Task UpdateItem(int id, CategoriesDto item)
        {
            var existing = await _repository.GetById(id);
            if (existing != null)
            {
                _mapper.Map(item, existing);
                await _repository.UpdateItem(id, existing);
            }
        }

        // מחיקת קטגוריה לפי מזהה
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // חיפוש קטגוריות לפי שם או תיאור (חיפוש טקסט חופשי)
        // משתמש ב-Find הגנרי של הרפוזיטורי שיודע לבצע LIKE query
        public async Task<List<CategoriesDto>> SearchByNameOrDescription(string search)
        {
            var entities = await _repository.Find(search);
            return _mapper.Map<List<CategoriesDto>>(entities);
        }

        // ספירת כמה משתמשים רשומים לקטגוריה מסוימת
        // שולף את כל רשומות UserCategories וסופר רק את אלה עם ה-CategoryID המתאים
        // משמש בעמוד הקטגוריות להצגת "X volunteers available"
        public async Task<int> GetUsersCountByCategory(int categoryId)
        {
            var userCategories = await _userCategoriesRepository.GetAll();

            return userCategories.Count(uc => uc.CategoryID == categoryId);
        }
    }
}