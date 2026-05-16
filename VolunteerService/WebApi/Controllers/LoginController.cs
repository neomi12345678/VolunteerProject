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
    public class LoginController : ControllerBase
    {
        private readonly ILoginService _loginService;
        private readonly IConfiguration _config;

        public LoginController(ILoginService loginService, IConfiguration config)
        {
            _loginService = loginService;
            _config = config;
        }

        [HttpPost]

        public async Task<IActionResult> Post([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _loginService.Authenticate(loginDto);
                if (user == null) return Unauthorized("Invalid email or password");

                // שימוש בפונקציה מה-Service שהזרקנו
                var token = _loginService.GenerateToken(user);
                return Ok(new { token = token, user = user });
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); } // שרשרי את ex.Message לדיבוג
        }
     
        [HttpGet("getUserByToken")]
        public async Task<IActionResult> GetUserByToken()
        {
            // קבלת ה־JWT מהכותרת Authorization
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return Unauthorized();

            var token = authHeader.Substring("Bearer ".Length);

            // אימות הטוקן
            var handler = new JwtSecurityTokenHandler();
            try
            {
                //פענח טוקן
                var jwtToken = handler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "UserId");
                if (userIdClaim == null)
                    return Unauthorized();

                var user = await _loginService.GetUserById(int.Parse(userIdClaim.Value));
                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch
            {
                return Unauthorized();
            }
        }
    }
}