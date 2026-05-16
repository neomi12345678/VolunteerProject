using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class AssignmentsRepository : IRepository<Assignments>
    {
        private readonly IContext _context;

        public AssignmentsRepository(IContext context)
        {
            _context = context;
        }

        public async Task<Assignments> AddItem(Assignments item)
        {
            _context.Assignments.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var item = await GetById(id);
            if (item != null)
            {
                _context.Assignments.Remove(item);
                await _context.SaveAsync();
            }
        }

        public async Task<List<Assignments>> GetAll()
        {
            return await _context.Assignments.ToListAsync();
        }

        public async Task<Assignments> GetById(int id)
        {
            return await _context.Assignments.FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task UpdateItem(int id, Assignments item)
        {
            var existing = await GetById(id);
            if (existing != null)
            {
                existing.VolunteerID = item.VolunteerID;
                existing.HelpRequestID = item.HelpRequestID;
                existing.AssignedAt = item.AssignedAt;
                existing.Status = item.Status;
                await _context.SaveAsync();
            }
        }

        public async Task<List<Assignments>> Find(string whereClause)
        {
            if (Enum.TryParse(whereClause, true, out AssignmentStatus status))
            {
                return await _context.Assignments.Where(a => a.Status == status).ToListAsync();
            }
            return new List<Assignments>();
        }
    }
}
