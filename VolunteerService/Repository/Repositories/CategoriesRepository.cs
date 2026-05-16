using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class CategoriesRepository : IRepository<Categories>
    {
        private readonly IContext _context;

        public CategoriesRepository(IContext context)
        {
            _context = context;
        }

        public async Task<Categories> AddItem(Categories item)
        {
            _context.Categories.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var category = await GetById(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveAsync();
            }
        }

        public async Task<List<Categories>> GetAll()
        {
            return await _context.Categories.ToListAsync();
        }

        public async Task<Categories> GetById(int id)
        {
            return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task UpdateItem(int id, Categories item)
        {
            var category = await GetById(id);
            if (category != null)
            {
                category.Name = item.Name;
                category.Description = item.Description;
                category.Icon = item.Icon;
                category.Embedding = item.Embedding;
                await _context.SaveAsync();
            }
        }

        public async Task<List<Categories>> Find(string whereClause)
        {
            var all = await _context.Categories.ToListAsync();
            return all.Where(c =>
                (c.Name != null && c.Name.Contains(whereClause, StringComparison.OrdinalIgnoreCase)) ||
                (c.Description != null && c.Description.Contains(whereClause, StringComparison.OrdinalIgnoreCase))
            ).ToList();
        }
    }
}
