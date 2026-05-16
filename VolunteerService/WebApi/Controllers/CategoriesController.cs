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
    public class CategoriesController : ControllerBase
    {
        private readonly IService<CategoriesDto> _service;

        public CategoriesController(IService<CategoriesDto> service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<List<CategoriesDto>> Get()
        {
            return await _service.GetAll();
        }

        [HttpGet("{id}")]
        public async Task<CategoriesDto> Get(int id)
        {
            return await _service.GetById(id);
        }

        [HttpPost]
        public async Task<CategoriesDto> Post([FromBody] CategoriesDto value)
        {
            return await _service.AddItem(value);
        }

        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] CategoriesDto value)
        {
            await _service.UpdateItem(id, value);
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await _service.DeleteItem(id);
        }
        [HttpGet("{id}/usersCount")]
        public async Task<int> GetUsersCount(int id)
        {
            return await (_service as CategoriesService).GetUsersCountByCategory(id);
        }
    }
}