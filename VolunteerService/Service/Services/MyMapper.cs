using AutoMapper;
using Repository.Entities;
using Service.Dto;
using System;
using System.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Service.Services
{
    // מחלקה שיורשת מ-Profile של AutoMapper
    // כאן מגדירים את כל חוקי ההמרה בין Entities ל-DTOs
    public class MyMapper : Profile
    {
        public MyMapper()
        {
            // ================= Users =================

            // מיפוי מ-Users (Entity) ל-UsersDto
            CreateMap<Users, UsersDto>()

             // מיפוי קטגוריות:
             // לוקחים את טבלת הקישור UserCategories
             // וממירים כל רשומה ל-CategoriesDto עם ה-ID בלבד
             .ForMember(dest => dest.Categories,
               opt => opt.MapFrom(src => src.UserCategories
                   .Select(uc => new CategoriesDto { Id = uc.CategoryID }).ToList()))

             // מיפוי זמינויות:
             // אם אין זמינויות → מחזירים רשימה ריקה
             // אחרת → ממירים כל Availability ל-DTO
             .ForMember(dest => dest.Availabilities,
  opt => opt.MapFrom(src => src.Availabilities == null
    ? new List<AvailabilitiesDto>()
    : src.Availabilities.Select(ua => new AvailabilitiesDto
    {
        Id = ua.Id,
        UserID = ua.UserID,

        // שים לב: כאן לוקחים נתונים מתוך האובייקט המקושר Availability
        Day = ua.Availability.Day,
        From_Time = ua.Availability.From_Time,
        To_Time = ua.Availability.To_Time

    }).ToList()));

            // מיפוי הפוך: מ-UsersDto ל-Users (למשל בעדכון/יצירה)
            CreateMap<UsersDto, Users>()

                // מתעלמים מ-UserCategories כי זה טבלת קישור
                // והיא מתמלאת ידנית בקוד השירות
                .ForMember(dest => dest.UserCategories, opt => opt.Ignore())

                // גם זמינויות מתמלאות ידנית ולא דרך AutoMapper
                .ForMember(dest => dest.Availabilities, opt => opt.Ignore());

            // ================= Register/Login =================

            // מיפוי מ-RegisterDto ל-Users
            CreateMap<RegisterDto, Users>()

                // ממפה Password ל-EncryptedPassword
                // שימי לב: ההצפנה עצמה לא כאן אלא במקום אחר (Service)
                .ForMember(dest => dest.EncryptedPassword, opt => opt.MapFrom(src => src.Password));

            // מיפוי LoginDto ל-Users (לרוב להשוואה)
            CreateMap<LoginDto, Users>();

            // ================= Categories =================

            // מיפוי דו-כיווני בין Categories ל-DTO
            CreateMap<Categories, CategoriesDto>().ReverseMap()

                // בעת המרה חזרה (DTO → Entity)
                // מעדכנים רק אם הערך לא null
                .ForMember(dest => dest.Name, opt => opt.Condition(src => src.Name != null))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.Icon, opt => opt.Condition(src => src.Icon != null));

            // ================= Availabilities =================      

            // מיפוי מ-DTO ל-Entity
            CreateMap<AvailabilitiesDto, Availabilities>()

     // מיפוי שעות התחלה
     .ForMember(dest => dest.From_Time, opt => opt.MapFrom(src => src.From_Time))

     // מיפוי שעות סיום
     .ForMember(dest => dest.To_Time, opt => opt.MapFrom(src => src.To_Time));

            // מיפוי מ-Entity ל-DTO
            CreateMap<Availabilities, AvailabilitiesDto>()

             .ForMember(dest => dest.From_Time, opt => opt.MapFrom(src => src.From_Time))
             .ForMember(dest => dest.To_Time, opt => opt.MapFrom(src => src.To_Time));

            // ================= HelpRequests =================

            // מיפוי דו-כיווני בין בקשות עזרה ל-DTO
            CreateMap<HelpRequests, HelpRequestsDto>().ReverseMap();

            // ================= Assignments =================

            // מיפוי דו-כיווני בין שיוכים (שיבוצים) ל-DTO
            CreateMap<Assignments, AssignmentsDto>().ReverseMap();

            // ================= ChatMessages =================

            // מיפוי דו-כיווני בין הודעות צ'אט ל-DTO
            CreateMap<ChatMessages, ChatMessagesDto>().ReverseMap();
        }
    }
}