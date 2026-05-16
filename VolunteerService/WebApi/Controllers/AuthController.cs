using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;
using Service.Services;

public class AuthController : ControllerBase
{
    private readonly ILoginService _loginService;
    private readonly UsersService _usersService; // כאן השינוי: הזרקה של המחלקה ולא של הממשק
    private readonly IMapper _mapper;

    public AuthController(ILoginService loginService, UsersService usersService, IMapper mapper)
    {
        _loginService = loginService;
        _usersService = usersService; // עכשיו יש לנו גישה לכל הפונקציות של UsersService
        _mapper = mapper;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var userEntity = await _usersService.GetEntityByEmail(loginDto.Email);
        if (userEntity == null)
            return Unauthorized("אימייל או סיסמה שגויים");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, userEntity.EncryptedPassword);
        if (!isPasswordValid)
            return Unauthorized("אימייל או סיסמה שגויים");

        var token = _loginService.GenerateToken(_mapper.Map<UsersDto>(userEntity));

        // כאן הוספנו role בתגובה
        return Ok(new
        {
            Token = token,
            role = userEntity.UserRole.ToString().ToUpper() // חשוב: "ADMIN" בדיוק
        });
    }
}

