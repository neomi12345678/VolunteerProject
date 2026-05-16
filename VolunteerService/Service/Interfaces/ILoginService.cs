using Service.Dto;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ILoginService
    {
        // הפונקציה הזו תבצע את הבדיקה (השוואת סיסמה) ותחזיר את המשתמש אם הוא קיים
        Task<UsersDto> Authenticate(LoginDto login);

        // פונקציה חדשה שיוצרת את ה-Token לאחר שהמשתמש אומת
        string GenerateToken(UsersDto user);

        Task<UsersDto> GetUserById(int id);
    }
}