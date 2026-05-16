using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace Service.Validations
{
    public class ValidationHelper
    {

        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return Regex.IsMatch(email,
                @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        }

        public static bool IsValidPhone(string phone)
            => !string.IsNullOrEmpty(phone) && Regex.IsMatch(phone, @"^\d{10}$");

        public static bool IsValidPassword(string password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 8) return false;
            if (!Regex.IsMatch(password, @"\d")) return false; // לפחות ספרה אחת
            if (!Regex.IsMatch(password, @"[a-zA-Z]")) return false; // לפחות אות אחת
            return true;

        }
    }
}


