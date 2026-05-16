using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AvailabilitiesController : ControllerBase
    {
        private readonly IService<AvailabilitiesDto> _service;

        public AvailabilitiesController(IService<AvailabilitiesDto> service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<List<AvailabilitiesDto>> Get()
        {
            return await _service.GetAll();
        }

        [HttpGet("{id}")]
        public async Task<AvailabilitiesDto> Get(int id)
        {
            return await _service.GetById(id);
        }

        [HttpGet("user/{userId}")]
        public async Task<List<AvailabilitiesDto>> GetByUserId(int userId)
        {
            var availabilitiesService = (Service.Services.AvailabilitiesService)_service;
            return await availabilitiesService.GetAvailabilitiesByUserId(userId);
        }

        [HttpPost]
        public async Task<AvailabilitiesDto> Post([FromBody] AvailabilitiesDto value)
        {
            return await _service.AddItem(value);
        }

        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] AvailabilitiesDto value)
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