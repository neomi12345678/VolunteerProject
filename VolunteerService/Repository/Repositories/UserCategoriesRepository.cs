using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class UserCategoriesRepository : IRepository<UserCategories>
    {
        private readonly IContext _context;

        public UserCategoriesRepository(IContext context)
        {
            _context = context;
        }

        public async Task<UserCategories> AddItem(UserCategories item)
        {
            _context.UserCategories.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var userCategory = await GetById(id);
            if (userCategory != null)
            {
                _context.UserCategories.Remove(userCategory);
                await _context.SaveAsync();
            }
        }

        public async Task<List<UserCategories>> GetAll()
        {
            return await _context.UserCategories.ToListAsync();
        }

        public async Task<UserCategories> GetById(int id)
        {
            return await _context.UserCategories.FirstOrDefaultAsync(uc => uc.Id == id);
        }

        public async Task UpdateItem(int id, UserCategories item)
        {
            var userCategory = await GetById(id);
            if (userCategory != null)
            {
                userCategory.UserID = item.UserID;
                userCategory.CategoryID = item.CategoryID;
                await _context.SaveAsync();
            }
        }

        public async Task<List<UserCategories>> Find(string whereClause)
        {
            var parts = whereClause.Split('-');
            if (parts.Length == 2 &&
                int.TryParse(parts[0], out int userId) &&
                int.TryParse(parts[1], out int categoryId))
            {
                return await _context.UserCategories
                    .Where(uc => uc.UserID == userId && uc.CategoryID == categoryId)
                    .ToListAsync();
            }
            return new List<UserCategories>();
        }
    }
}
