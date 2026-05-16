using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Services; // <-- חשוב! כאן כדי להכיר את HelpRequestsService
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HelpRequestsController : ControllerBase
    {
        private readonly HelpRequestsService _service; // <-- השתנה מ-IService ל-Service עצמו

        public HelpRequestsController(HelpRequestsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<List<HelpRequestsDto>> Get()
        {
            return await _service.GetAll();
        }

        [HttpGet("{id}")]
        public async Task<HelpRequestsDto> Get(int id)
        {
            return await _service.GetById(id);
        }

        // POST אחד בלבד – כאן שולחים את הבקשה ל-Service שמטפל ב-AI
        [HttpPost]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] HelpRequestsDto value)
        {
            try
            {
                var result = await _service.AddHelpRequestWithAI(value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // מדפיסים את השגיאה בקונסול של השרת
                Console.WriteLine($"ERROR in HelpRequestsController POST: {ex}");
                // מחזירים ללקוח JSON עם הודעה מלאה
                return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] HelpRequestsDto value)
        {
            await _service.UpdateItem(id, value);
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await _service.DeleteItem(id);
        }
    }
}

