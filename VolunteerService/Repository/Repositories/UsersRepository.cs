using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class UsersRepository : IRepository<Users>
    {
        private readonly IContext _context;

        public UsersRepository(IContext context)
        {
            _context = context;
        }

        public async Task<Users> AddItem(Users item)
        {
            _context.Users.Add(item);
            await _context.SaveAsync();

            // שמירת UserCategories
            if (item.UserCategories != null)
            {
                foreach (var category in item.UserCategories)
                {
                    category.UserID = item.Id;
                    _context.UserCategories.Add(category);
                }
            }

            // שמירת Availabilities
            if (item.Availabilities != null)
            {
                foreach (var availability in item.Availabilities)
                {
                    availability.UserID = item.Id;
                    _context.UserAvailabilities.Add(availability);
                }
            }

            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var user = await GetById(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveAsync();
            }
        }

        public async Task<List<Users>> GetAll()
        {
            var users = await _context.Users.ToListAsync();

            foreach (var user in users)
            {
                user.Availabilities = await _context.UserAvailabilities
               .Where(a => a.UserID == user.Id)
               .Include(ua => ua.Availability)
               .ToListAsync();

                user.UserCategories = await _context.UserCategories
                    .Where(uc => uc.UserID == user.Id)
                    .ToListAsync();
            }

            return users;
        }

        public async Task<Users> GetById(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user != null)
            {
                user.Availabilities = await _context.UserAvailabilities
      .Where(a => a.UserID == user.Id)
      .ToListAsync();

                user.UserCategories = await _context.UserCategories
                    .Where(uc => uc.UserID == user.Id)
                    .ToListAsync();
            }
            return user;
        }

        public async Task UpdateItem(int id, Users item)
        {
            var user = await GetById(id);
            if (user != null)
            {
                user.FullName = item.FullName;
                user.Email = item.Email;
                user.EncryptedPassword = item.EncryptedPassword;
                user.Phone = item.Phone;
                user.City = item.City;
                user.Street = item.Street;
                user.Latitude = item.Latitude;
                user.Longitude = item.Longitude;
                user.UserRole = item.UserRole;
                user.Rating = item.Rating;
                if (item.Availabilities != null)
                {
                    foreach (var newAvailability in item.Availabilities)
                    {
                        if (!user.Availabilities.Any(a => a.AvailabilityID == newAvailability.AvailabilityID))
                        {
                            newAvailability.UserID = user.Id;
                            _context.UserAvailabilities.Add(newAvailability); // EF יעקוב אחרי זה
                            user.Availabilities.Add(newAvailability);
                        }
                    }
                }
                user.UserCategories = item.UserCategories;
                await _context.SaveAsync();
            }
        }

        public async Task<List<Users>> Find(string whereClause)
        {
            // משיכת כל הנתונים מהמסד (או ביצוע שאילתה ישירה אם הטבלה גדולה)
            var all = await _context.Users.ToListAsync();

            return all.Where(u =>
                u.FullName.Contains(whereClause, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(whereClause, StringComparison.OrdinalIgnoreCase) ||
                u.Phone.Contains(whereClause, StringComparison.OrdinalIgnoreCase) ||
                u.City.Contains(whereClause, StringComparison.OrdinalIgnoreCase) ||
                u.Street.Contains(whereClause, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

    }
}


