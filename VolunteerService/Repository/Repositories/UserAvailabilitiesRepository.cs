using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class UserAvailabilitiesRepository : IRepository<UserAvailabilities>
    {
        private readonly IContext _context;

        public UserAvailabilitiesRepository(IContext context)
        {
            _context = context;
        }

        public async Task<UserAvailabilities> AddItem(UserAvailabilities item)
        {
            _context.UserAvailabilities.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var userAvailability = await GetById(id);
            if (userAvailability != null)
            {
                _context.UserAvailabilities.Remove(userAvailability);
                await _context.SaveAsync();
            }
        }

        public async Task<List<UserAvailabilities>> GetAll()
        {
            return await _context.UserAvailabilities.ToListAsync();
        }

        public async Task<UserAvailabilities> GetById(int id)
        {
            return await _context.UserAvailabilities.FirstOrDefaultAsync(ua => ua.Id == id);
        }

        public async Task UpdateItem(int id, UserAvailabilities item)
        {
            var userAvailability = await GetById(id);
            if (userAvailability != null)
            {
                userAvailability.UserID = item.UserID;
                userAvailability.AvailabilityID = item.AvailabilityID;
                await _context.SaveAsync();
            }
        }

        public async Task<List<UserAvailabilities>> Find(string whereClause)
        {
            int.TryParse(whereClause, out int id);
            return await _context.UserAvailabilities
                .Where(ua => ua.UserID == id || ua.AvailabilityID == id)
                .ToListAsync();
        }
    }
}
