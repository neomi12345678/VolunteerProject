using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Dto;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly IRegisterService _registerService;
        private readonly ILoginService _loginService;

        public RegisterController(IRegisterService registerService, ILoginService loginService)
        {
            _registerService = registerService;
            _loginService = loginService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RegisterDto registerDto)
        {
            var user = await _registerService.Register(registerDto);

            if (user == null)
                return BadRequest("User already exists");

            var token = _loginService.GenerateToken(user);

            return Ok(new
            {
                token = token,
                user = user
            });
        }
    }
}