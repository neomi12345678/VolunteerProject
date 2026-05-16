using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Repositories
{
    public class ChatMessagesRepository : IRepository<ChatMessages>
    {
        private readonly IContext _context;

        public ChatMessagesRepository(IContext context)
        {
            _context = context;
        }

        public async Task<ChatMessages> AddItem(ChatMessages item)
        {
            _context.ChatMessages.Add(item);
            await _context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var message = await GetById(id);
            if (message != null)
            {
                _context.ChatMessages.Remove(message);
                await _context.SaveAsync();
            }
        }

        public async Task<List<ChatMessages>> GetAll()
        {
            return await _context.ChatMessages.ToListAsync();
        }

        public async Task<ChatMessages> GetById(int id)
        {
            return await _context.ChatMessages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task UpdateItem(int id, ChatMessages item)
        {
            var message = await GetById(id);
            if (message != null)
            {
                message.AssignmentID = item.AssignmentID;
                message.SenderID = item.SenderID;
                message.MessageContent = item.MessageContent;
                message.Timestamp = item.Timestamp;
                await _context.SaveAsync();
            }
        }

        public async Task<List<ChatMessages>> Find(string whereClause)
        {
            var all = await _context.ChatMessages.ToListAsync();
            return all.Where(m =>
                !string.IsNullOrEmpty(m.MessageContent) &&
                m.MessageContent.Contains(whereClause, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }
    }
}