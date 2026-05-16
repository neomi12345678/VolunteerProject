using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatMessagesController : ControllerBase
    {
        private readonly IService<ChatMessagesDto> _service;
        private readonly IRepository<ChatMessages> _chatRepository;

        public ChatMessagesController(
            IService<ChatMessagesDto> service,
            IRepository<ChatMessages> chatRepository)
        {
            _service = service;
            _chatRepository = chatRepository;
        }

        [HttpGet]
        public async Task<List<ChatMessagesDto>> Get()
        {
            return await _service.GetAll();
        }

        [HttpGet("{id}")]
        public async Task<ChatMessagesDto> Get(int id)
        {
            return await _service.GetById(id);
        }

        [HttpPost]
        public async Task<ChatMessagesDto> Post([FromBody] ChatMessagesDto value)
        {
            return await _service.AddItem(value);
        }

        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] ChatMessagesDto value)
        {
            await _service.UpdateItem(id, value);
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await _service.DeleteItem(id);
        }

        // GET api/chatmessages/assignment/{assignmentId}
        // Returns all messages for a specific assignment, ordered by timestamp.
        [HttpGet("assignment/{assignmentId}")]
        public async Task<ActionResult<List<ChatMessagesDto>>> GetByAssignment(int assignmentId)
        {
            var all = await _chatRepository.GetAll();

            var messages = all
                .Where(m => m.AssignmentID == assignmentId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessagesDto
                {
                    Id = m.Id,
                    AssignmentID = m.AssignmentID,
                    SenderID = m.SenderID,
                    MessageContent = m.MessageContent,
                    Timestamp = m.Timestamp,
                })
                .ToList();

            return Ok(messages);
        }
    }
}
