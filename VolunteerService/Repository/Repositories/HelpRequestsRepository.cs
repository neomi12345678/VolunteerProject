using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class HelpRequestsRepository : IRepository<HelpRequests>
    {
        private readonly IContext _context;

        public HelpRequestsRepository(IContext context)
        {
            _context = context;
        }

        public async Task<HelpRequests> AddItem(HelpRequests item)
        {
            // שומרים את הזמינות קודם כדי שתקבל Id
            if (item.Availability != null)
            {
                _context.Availabilities.Add(item.Availability);
                await _context.SaveAsync();
                // item.Availability.Id כבר מעודכן כאן
            }

            _context.HelpRequests.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var item = await GetById(id);
            if (item != null)
            {
                _context.HelpRequests.Remove(item);
                await _context.SaveAsync();
            }
        }

        public async Task<List<HelpRequests>> GetAll()
        {
            return await _context.HelpRequests
                .Include(hr => hr.Availability)   // ← טוען את הזמינות בכל קריאה
                .ToListAsync();
        }

        public async Task<HelpRequests> GetById(int id)
        {
            return await _context.HelpRequests
                .Include(hr => hr.Availability)   // ← טוען את הזמינות
                .FirstOrDefaultAsync(hr => hr.Id == id);
        }

        public async Task UpdateItem(int id, HelpRequests item)
        {
            var existing = await GetById(id); // כולל Availability
            if (existing == null) return;

            existing.NeedyID = item.NeedyID;
            existing.CategoryID = item.CategoryID;
            existing.Description = item.Description;
            existing.Status = item.Status;
            existing.CreatedAt = item.CreatedAt;

            if (item.Availability != null)
            {
                if (existing.Availability == null)
                {
                    existing.Availability = new Availabilities
                    {
                        UserID = item.Availability.UserID,
                        Day = item.Availability.Day,
                        From_Time = item.Availability.From_Time,
                        To_Time = item.Availability.To_Time
                    };
                }
                else
                {
                    existing.Availability.UserID = item.Availability.UserID;
                    existing.Availability.Day = item.Availability.Day;
                    existing.Availability.From_Time = item.Availability.From_Time;
                    existing.Availability.To_Time = item.Availability.To_Time;
                }
            }
            else if (existing.Availability != null)
            {
                _context.Availabilities.Remove(existing.Availability);
                existing.Availability = null;
            }

            await _context.SaveAsync();
        }

        public async Task<List<HelpRequests>> Find(string whereClause)
        {
            return await _context.HelpRequests
                .Include(hr => hr.Availability)
                .Where(hr => hr.Description.Contains(whereClause))
                .ToListAsync();
        }
    }
}

