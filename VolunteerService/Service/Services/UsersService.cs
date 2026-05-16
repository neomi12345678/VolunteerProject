using AutoMapper;
using BCrypt.Net;
using Repository.Entities;
using Repository.Interfaces;
using Repository.Repositories;
using Service.Dto;
using Service.Helpers; // שירות להמרת כתובת לקואורדינטות (Geocoding)
using Service.Interfaces;
using Service.Validations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Services
{
    public class UsersService : IUserService
    {
        // רפוזיטוריז לגישה לטבלאות שונות במסד נתונים
        private readonly IRepository<Users> _repository;
        private readonly IRepository<UserCategories> _userCategoriesRepository;
        private readonly IRepository<Categories> _categoriesRepository;
        private readonly IRepository<UserAvailabilities> _userAvailabilitiesRepository;
        private readonly IRepository<Availabilities> _AvailabilitiesRepository;

        // AutoMapper להמרה בין Entity ל-DTO
        private readonly IMapper _mapper;

        // קונסטרקטור עם Dependency Injection
        public UsersService(IRepository<Users> repository,
                            IRepository<UserCategories> userCategoriesRepository,
                            IRepository<Categories> categoriesRepository, IRepository<UserAvailabilities> _userAvailabilitiesRepository, IRepository<Availabilities> _AvailabilitiesRepository,
                            IMapper mapper)
        {
            _repository = repository;
            _userCategoriesRepository = userCategoriesRepository;
            _categoriesRepository = categoriesRepository;
            this._userAvailabilitiesRepository = _userAvailabilitiesRepository;
            this._AvailabilitiesRepository = _AvailabilitiesRepository;
            _mapper = mapper;
        }

        // מחזיר את כל המשתמשים כולל הקטגוריות שלהם
        public async Task<List<UsersDto>> GetAll()
        {
            var users = await _repository.GetAll(); // שליפת כל המשתמשים
            var allCategories = await _categoriesRepository.GetAll(); // כל הקטגוריות הכלליות הקיימות
            var userCategories = await _userCategoriesRepository.GetAll(); // טבלת קישור-מכילה בחירות של משתמשים לקטגוריות

            // בניית DTO לכל משתמש + הצמדת הקטגוריות שלו
            var result = users.Select(user =>
            {
                var dto = _mapper.Map<UsersDto>(user);

                dto.Categories = userCategories
                    .Where(uc => uc.UserID == user.Id) // רק הקטגוריות של המשתמש
                    .Select(uc => allCategories
                        .Where(c => c.Id == uc.CategoryID)
                        .Select(c => _mapper.Map<CategoriesDto>(c))
                        .FirstOrDefault())
                    .Where(c => c != null)
                    .ToList();

                return dto;
            }).ToList();

            return result;
        }

        // מחזיר משתמש לפי ID כולל קטגוריות וזמינויות
        public async Task<UsersDto> GetById(int id)
        {
            var user = await _repository.GetById(id);
            if (user == null) return null;

            var dto = _mapper.Map<UsersDto>(user);

            // טעינת קטגוריות של המשתמש
            var allCategories = await _categoriesRepository.GetAll();
            var userCategories = (await _userCategoriesRepository.GetAll())
                                 .Where(uc => uc.UserID == id);

            dto.Categories = userCategories
                .Select(uc => allCategories
                    .Where(c => c.Id == uc.CategoryID)
                    .Select(c => _mapper.Map<CategoriesDto>(c))
                    .FirstOrDefault())
                .Where(c => c != null)
                .ToList();

            // טעינת זמינויות של המשתמש (דרך טבלת קישור)
            var allUserAvailabilities = (await _userAvailabilitiesRepository.GetAll())
                                         .Where(ua => ua.UserID == id);

            var allAvailabilities = await _AvailabilitiesRepository.GetAll();

            dto.Availabilities = allUserAvailabilities
                .Select(ua => allAvailabilities
                    .Where(a => a.Id == ua.AvailabilityID)
                    .Select(a => _mapper.Map<AvailabilitiesDto>(a))
                    .FirstOrDefault())
                .Where(a => a != null)
                .ToList();

            return dto;
        }

        // הוספת משתמש חדש
        public async Task<UsersDto> AddItem(UsersDto item)
        {
            // חישוב קואורדינטות לפי כתובת
            double latitude = 0;
            double longitude = 0;

            try
            {
                (latitude, longitude) = await GeocodingService.GetCoordinates(item.Street, item.City);
            }
            catch
            {
                // אם נכשל - שמים 0
                latitude = 0;
                longitude = 0;
            }

            // המרה ל-Entity ושמירת הקואורדינטות
            var entity = _mapper.Map<Users>(item);
            entity.Latitude = latitude;
            entity.Longitude = longitude;

            var added = await _repository.AddItem(entity);

            return _mapper.Map<UsersDto>(added);
        }

        // עדכון משתמש
        public async Task UpdateItem(int id, UsersDto item)
        {
            // בדיקות תקינות
            if (!ValidationHelper.IsValidEmail(item.Email))
                throw new ArgumentException("פורמט המייל אינו תקין");

            if (!ValidationHelper.IsValidPhone(item.Phone))
                throw new ArgumentException("פורמט הטלפון אינו תקין");

            // בדיקה שאין משתמש אחר עם אותו מייל
            var emailExists = (await _repository.GetAll())
                .Any(u => u.Email == item.Email && u.Id != id);

            if (emailExists)
                throw new ArgumentException("המייל כבר קיים במערכת עבור משתמש אחר");

            var existing = await _repository.GetById(id);

            if (existing != null)
            {
                // אם הכתובת השתנתה → מחשבים קואורדינטות מחדש
                if (existing.City != item.City || existing.Street != item.Street)
                {
                    try
                    {
                        (existing.Latitude, existing.Longitude) =
                            await GeocodingService.GetCoordinates(item.Street, item.City);
                    }
                    catch
                    {
                        existing.Latitude = 0;
                        existing.Longitude = 0;
                    }
                }

                // העתקת הערכים מה-DTO ל-Entity
                _mapper.Map(item, existing);

                await _repository.UpdateItem(id, existing);
            }
            else
            {
                throw new Exception("משתמש לא נמצא");
            }
        }

        // מחיקת משתמש
        public async Task DeleteItem(int id)
            => await _repository.DeleteItem(id);

        // הוספת קטגוריה למשתמש
        public async Task AddCategoryToUser(int userId, int categoryId)
        {
            // בדיקה אם כבר קיים קשר
            var exists = (await _userCategoriesRepository.GetAll())
                .Any(uc => uc.UserID == userId && uc.CategoryID == categoryId);

            if (exists) return;

            var userCategory = new UserCategories
            {
                UserID = userId,
                CategoryID = categoryId
            };

            await _userCategoriesRepository.AddItem(userCategory);
        }

        // הוספת זמינות למשתמש
        public async Task AddAvailabilityToUser(int userId, int availabilityId)
        {
            var exists = (await _userAvailabilitiesRepository.GetAll())
                .Any(ua => ua.UserID == userId && ua.AvailabilityID == availabilityId);

            if (exists) return;

            var userAvailability = new UserAvailabilities
            {
                UserID = userId,
                AvailabilityID = availabilityId
            };

            await _userAvailabilitiesRepository.AddItem(userAvailability);
        }

        // הסרת קטגוריה ממשתמש
        public async Task RemoveCategoryFromUser(int userId, int categoryId)
        {
            var existing = (await _userCategoriesRepository.GetAll())
                .FirstOrDefault(uc => uc.UserID == userId && uc.CategoryID == categoryId);

            if (existing != null)
                await _userCategoriesRepository.DeleteItem(existing.Id);
        }

        // הסרת זמינות ממשתמש
        public async Task RemoveAvailabilityFromUser(int userId, int availabilityId)
        {
            var existing = (await _userAvailabilitiesRepository.GetAll())
                .FirstOrDefault(ua => ua.UserID == userId && ua.AvailabilityID == availabilityId);

            if (existing != null)
                await _userAvailabilitiesRepository.DeleteItem(existing.Id);
        }

        // יצירת אדמין אם לא קיים
        public async Task CreateAdminIfNotExists()
        {
            var allUsers = await _repository.GetAll();

            if (!allUsers.Any(u => u.UserRole == UserRole.Admin))
            {
                var admin = new Users
                {
                    FullName = "Admin",
                    Email = "admin@mail.com",
                    EncryptedPassword = BCrypt.Net.BCrypt.HashPassword("123456"), // הצפנת סיסמה
                    UserRole = UserRole.Admin,
                    Phone = "0500000000",
                    City = "System",
                    Street = "System",
                    Rating = 0
                };

                await _repository.AddItem(admin);
            }
        }

        // שליפת משתמש לפי מייל
        public async Task<Users> GetEntityByEmail(string email)
        {
            var users = await _repository.GetAll();
            return users.FirstOrDefault(u => u.Email == email);
        }

        // החזרת כל המתנדבים בלבד
        public async Task<List<UsersDto>> GetVolunteers()
        {
            var users = await _repository.GetAll();

            // סינון לפי Role
            var volunteers = users
                .Where(u => u.UserRole == UserRole.Volunteer)
                .ToList();

            var allCategories = await _categoriesRepository.GetAll();
            var userCategories = await _userCategoriesRepository.GetAll();

            // בניית DTO כולל קטגוריות לכל מתנדב
            var result = volunteers.Select(user =>
            {
                var dto = _mapper.Map<UsersDto>(user);

                dto.Categories = userCategories
                    .Where(uc => uc.UserID == user.Id)
                    .Select(uc => allCategories
                        .Where(c => c.Id == uc.CategoryID)
                        .Select(c => _mapper.Map<CategoriesDto>(c))
                        .FirstOrDefault())
                    .Where(c => c != null)
                    .ToList();

                return dto;
            }).ToList();

            return result;
        }
    }
}




