using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;
using Service.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IService<UsersDto> _service;
        private readonly UsersService _usersService; // הוספת הזרקה של המימוש הספציפי

        public UsersController(IService<UsersDto> service, UsersService usersService)
        {
            _service = service;
            _usersService = usersService;
        }

        [HttpGet]
        public async Task<List<UsersDto>> Get()
        {
            return await _service.GetAll();
        }

        [HttpGet("{id}")]
        public async Task<UsersDto> Get(int id)
        {
            return await _service.GetById(id);
        }

        [HttpPost]
        public async Task<UsersDto> Post([FromBody] UsersDto value)
        {
            return await _service.AddItem(value);
        }

        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] UsersDto value)
        {
            await _service.UpdateItem(id, value);
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await _service.DeleteItem(id);
        }


        // הסרה של קטגוריה
        [HttpDelete("{userId}/category/{categoryId}")]
        public async Task<IActionResult> RemoveCategoryFromUser(int userId, int categoryId)
        {
            // שימוש ישיר ב-UsersService ללא ה-"as" הבעייתי
            await _usersService.RemoveCategoryFromUser(userId, categoryId);
            return Ok();
        }

        [HttpPost("{userId}/category/{categoryId}")]
        public async Task<IActionResult> AddCategoryToUser(int userId, int categoryId)
        {
            await _usersService.AddCategoryToUser(userId, categoryId);
            return Ok();
        }
        // POST api/users/{userId}/availability/{availabilityId}
        // מוסיף זמינות למשתמש
        [HttpPost("{userId}/availability/{availabilityId}")]
        public async Task<IActionResult> AddAvailabilityToUser(int userId, int availabilityId)
        {
            await _usersService.AddAvailabilityToUser(userId, availabilityId);
            return Ok();
        }

        // DELETE api/users/{userId}/availability/{availabilityId}
        // מסיר זמינות ממשתמש
        [HttpDelete("{userId}/availability/{availabilityId}")]
        public async Task<IActionResult> RemoveAvailabilityFromUser(int userId, int availabilityId)
        {
            await _usersService.RemoveAvailabilityFromUser(userId, availabilityId);
            return Ok();
        }

    }
}







