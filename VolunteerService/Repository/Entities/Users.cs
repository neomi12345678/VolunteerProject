using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // חשוב להוסיף עבור בדיקות תקינות
using System.ComponentModel.DataAnnotations.Schema;

namespace Repository.Entities
{
    public enum UserRole
    {
        Volunteer,  // מתנדב
        Needy,      // נזקק
        Admin,      // מנהל
    }

    public class Users
    {
        [Key] // מגדיר את השדה כמפתח ראשי
        public int Id { get; set; }

        [Required(ErrorMessage = "שם מלא הוא שדה חובה")]
        [StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "אימייל הוא שדה חובה")]
        [EmailAddress(ErrorMessage = "כתובת אימייל לא תקינה")]
        public string Email { get; set; }

        [Required]
        public string EncryptedPassword { get; set; }

        [Required]
        [Phone(ErrorMessage = "מספר טלפון לא תקין")]
        [RegularExpression(@"^\d{9,10}$", ErrorMessage = "טלפון חייב להכיל בין 9 ל-10 ספרות")]
        public string Phone { get; set; }

        [Required]
        public string City { get; set; }
        [Required]
        public string Street { get; set; }

        // בדיקת טווח קואורדינטות (סטנדרט עולמי)
        [Range(-90, 90)]
        public double Latitude { get; set; }

        [Range(-180, 180)]
        public double Longitude { get; set; }

        [Required]
        public UserRole UserRole { get; set; }

        [Range(0, 5)] // בהנחה שהדירוג הוא בין 0 ל-5
        public double Rating { get; set; }

        // קשרים בין טבלאות
        public List<UserAvailabilities> Availabilities { get; set; } = new List<UserAvailabilities>();
        public List<UserCategories> UserCategories { get; set; } = new List<UserCategories>();
    }
}

