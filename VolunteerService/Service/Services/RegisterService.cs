
using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using Service.Validations;
using System;
using System.Linq;
using System.Threading.Tasks;
using Service.Helpers;

namespace Service.Services
{
    public class RegisterService : IRegisterService
    {
        // רפוזיטוריז לגישה למסד נתונים
        private readonly IRepository<Users> _repository;
        private readonly IRepository<UserCategories> _userCategoriesRepository;
        private readonly IRepository<UserAvailabilities> _userAvailabilitiesRepository;
        private readonly IRepository<Availabilities> _availabilitiesRepository;

        // AutoMapper להמרות בין אובייקטים
        private readonly IMapper _mapper;

        // קונסטרקטור עם Dependency Injection
        public RegisterService(
            IRepository<Users> repository,
            IRepository<UserCategories> userCategoriesRepository,
            IRepository<UserAvailabilities> userAvailabilitiesRepository,
            IRepository<Availabilities> availabilitiesRepository,
            IMapper mapper)
        {
            _repository = repository;
            _userCategoriesRepository = userCategoriesRepository;
            _userAvailabilitiesRepository = userAvailabilitiesRepository;
            _availabilitiesRepository = availabilitiesRepository;
            _mapper = mapper;
        }

        // פונקציית רישום משתמש חדש
        public async Task<UsersDto> Register(RegisterDto register)
        {
            // בדיקה אם כבר קיים משתמש עם אותו מייל
            var existingUser = (await _repository.GetAll())
                                .FirstOrDefault(u => u.Email == register.Email);

            if (existingUser != null)
                return null; // אם קיים - לא ממשיכים

            // בדיקות תקינות על הנתונים שהמשתמש שלח
            if (!ValidationHelper.IsValidEmail(register.Email))
                throw new ArgumentException("מייל לא תקין");

            if (!ValidationHelper.IsValidPhone(register.Phone))
                throw new ArgumentException("טלפון לא תקין");

            if (!ValidationHelper.IsValidPassword(register.Password))
                throw new ArgumentException("סיסמה חלשה מדי");

            // ================= יצירת משתמש =================

            // 1. קבלת קואורדינטות (Latitude, Longitude) לפי כתובת
            var coordinates = await Service.Helpers.GeocodingService.GetCoordinates(register.Street, register.City);

            // 2. יצירת אובייקט Users עם כל הנתונים
            var user = new Users
            {
                FullName = register.FullName,
                Email = register.Email,
                Phone = register.Phone,
                City = register.City,
                Street = register.Street,
                UserRole = register.UserRole,

                // שמירת הקואורדינטות שהתקבלו מהשירות
                Latitude = coordinates.Item1,
                Longitude = coordinates.Item2,

                // הצפנת סיסמה לפני שמירה
                EncryptedPassword = BCrypt.Net.BCrypt.HashPassword(register.Password)
            };

            // שמירת המשתמש במסד הנתונים
            var addedUser = await _repository.AddItem(user);

            // ================= שמירת קטגוריות =================

            // מעבר על כל הקטגוריות שנבחרו ברישום
            foreach (var categoryId in register.CategoryIds)
            {
                // יצירת קשר בין משתמש לקטגוריה (טבלת קישור)
                await _userCategoriesRepository.AddItem(new UserCategories
                {
                    UserID = addedUser.Id,
                    CategoryID = categoryId
                });
            }

            // ================= שמירת זמינויות =================

            foreach (var availabilityDto in register.Availabilities)
            {
                // קודם יוצרים רשומת זמינות בטבלת Availabilities
                var availability = await _availabilitiesRepository.AddItem(new Availabilities
                {
                    UserID = addedUser.Id,
                    Day = availabilityDto.Day,
                    From_Time = availabilityDto.From_Time,
                    To_Time = availabilityDto.To_Time
                });

                // אחר כך יוצרים קשר בין המשתמש לזמינות (טבלת קישור)
                await _userAvailabilitiesRepository.AddItem(new UserAvailabilities
                {
                    UserID = addedUser.Id,
                    AvailabilityID = availability.Id
                });
            }

            // ================= טעינה מחדש =================

            // שליפת המשתמש שוב (כדי לקבל נתונים מעודכנים מה-DB)
            var addedUserWithDetails = await _repository.GetById(addedUser.Id);

            // המרה ל-DTO והחזרה
            return _mapper.Map<UsersDto>(addedUserWithDetails);
        }

        // פונקציה פרטית להצפנת סיסמה (לא בשימוש בפועל בקוד הזה)
        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                // המרה לבייטים וחישוב hash
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));

                // המרה למחרוזת הקסדצימלית
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }
    }
}
