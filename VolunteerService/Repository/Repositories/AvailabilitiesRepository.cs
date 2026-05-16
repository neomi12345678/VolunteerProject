using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class AvailabilitiesRepository : IRepository<Availabilities>
    {
        private readonly IContext _context;

        public AvailabilitiesRepository(IContext context)
        {
            _context = context;
        }

        public async Task<Availabilities> AddItem(Availabilities item)
        {
            _context.Availabilities.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var item = await GetById(id);
            if (item != null)
            {
                _context.Availabilities.Remove(item);
                await _context.SaveAsync();
            }
        }

        public async Task<List<Availabilities>> GetAll()
        {
            return await _context.Availabilities.ToListAsync();
        }

        public async Task<Availabilities> GetById(int id)
        {
            return await _context.Availabilities.FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task UpdateItem(int id, Availabilities item)
        {
            var existing = await GetById(id);
            if (existing != null)
            {
                existing.UserID = item.UserID;
                existing.Day = item.Day;
                existing.From_Time = item.From_Time;
                existing.To_Time = item.To_Time;
                await _context.SaveAsync();
            }
        }

        public async Task<List<Availabilities>> Find(string whereClause)
        {
            return await _context.Availabilities
                .Where(a => a.Day.ToString().Contains(whereClause))
                .ToListAsync();
        }
    }
}
