
using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using Service.Validations;
using System.Security.Cryptography;

namespace Service.Services
{
    public class LoginService : ILoginService
    {
        private readonly IRepository<Users> _repository;
        private readonly IMapper _mapper;

        // גישה להגדרות (כמו מפתח JWT)
        private readonly IConfiguration _configuration;

        // קונסטרקטור עם Dependency Injection
        public LoginService(IRepository<Users> repository, IMapper mapper, IConfiguration configuration)
        {
            _repository = repository;
            _mapper = mapper;
            _configuration = configuration;
        }

        // =====================================================
        // פונקציית התחברות (בדיקת אימות משתמש)
        // =====================================================
        public async Task<UsersDto> Authenticate(LoginDto login)
        {
            // שליפת משתמש לפי אימייל
            var user = (await _repository.GetAll()).FirstOrDefault(u => u.Email == login.Email);

            // אם לא קיים משתמש כזה → שגיאה
            if (user == null)
                throw new ArgumentException("User does not exist.");

            // בדיקת סיסמה: משווים סיסמה רגילה מול hash מוצפן (BCrypt)
            if (!BCrypt.Net.BCrypt.Verify(login.Password, user.EncryptedPassword))
                throw new ArgumentException("Incorrect password");

            // בדיקת תקינות פורמט מייל (למרות שכבר קיים משתמש)
            if (!ValidationHelper.IsValidEmail(login.Email))
                throw new ArgumentException("Incorrect email");

            // החזרת המשתמש כ-DTO
            return _mapper.Map<UsersDto>(user);
        }

        // =====================================================
        // יצירת JWT Token למשתמש
        // =====================================================
        public string GenerateToken(UsersDto user)
        {
            // יצירת מפתח הצפנה מהקונפיגורציה (appsettings.json)
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            // הגדרת סוג ההצפנה (HmacSha256)
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // יצירת רשימת Claims (מידע שנשמר בתוך הטוקן)
            var claims = new[]
            {
                new Claim("UserId", user.Id.ToString()), // מזהה משתמש
                new Claim(ClaimTypes.Name, user.Email),  // אימייל
                new Claim(ClaimTypes.Role, user.UserRole.ToString()) // תפקיד (Admin / Volunteer וכו')
            };

            // יצירת הטוקן עצמו
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],   // מי יצר את הטוקן
                _configuration["Jwt:Audience"], // למי הוא מיועד
                claims,                         // המידע בפנים
                expires: DateTime.Now.AddDays(7), // תוקף הטוקן (7 ימים)
                signingCredentials: credentials // חתימה קריפטוגרפית
            );

            // המרה למחרוזת לשליחה ללקוח
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // =====================================================
        // שליפת משתמש לפי ID
        // =====================================================
        public async Task<UsersDto> GetUserById(int id)
        {
            // חיפוש המשתמש במסד נתונים
            var user = (await _repository.GetAll())
                        .FirstOrDefault(u => u.Id == id);

            // אם לא נמצא → מחזירים null, אחרת ממירים ל-DTO
            return user == null ? null : _mapper.Map<UsersDto>(user);
        }
    }
}