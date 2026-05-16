using AutoMapper;
using CodeFirst.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Repository.Entities;
using Repository.Interfaces;
using Repository.Repositories;
using Service;
using Service.Dto;
using Service.Interfaces;
using Service.Services;
using System.Text;
using BCrypt.Net; 

var builder = WebApplication.CreateBuilder(args);

// ==========================
// 0️⃣ AutoMapper
// ==========================
builder.Services.AddAutoMapper(typeof(MyMapper));

// ==========================
// 1️⃣ DbContext + IContext
// ==========================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IContext>(provider => provider.GetRequiredService<AppDbContext>());

// ==========================
// 2️⃣ Repositories
// ==========================
builder.Services.AddScoped<IRepository<Users>, UsersRepository>();
builder.Services.AddScoped<IRepository<HelpRequests>, HelpRequestsRepository>();
builder.Services.AddScoped<IRepository<Assignments>, AssignmentsRepository>();
builder.Services.AddScoped<IRepository<Categories>, CategoriesRepository>();
builder.Services.AddScoped<IRepository<Availabilities>, AvailabilitiesRepository>();
builder.Services.AddScoped<IRepository<UserAvailabilities>, UserAvailabilitiesRepository>();
builder.Services.AddScoped<IRepository<UserCategories>, UserCategoriesRepository>();
builder.Services.AddScoped<IRepository<ChatMessages>, ChatMessagesRepository>();

// ==========================
// 3️⃣ Services
// ==========================
builder.Services.AddScoped<IService<UsersDto>, UsersService>();
// הוספתי רישום ספציפי ל-UsersService כדי שנוכל למשוך אותו ל-Seed
builder.Services.AddScoped<UsersService>();

builder.Services.AddScoped<IService<AssignmentsDto>, AssignmentsService>();
builder.Services.AddScoped<IService<HelpRequestsDto>, HelpRequestsService>();
builder.Services.AddScoped<IService<CategoriesDto>, CategoriesService>();
builder.Services.AddScoped<IService<AvailabilitiesDto>, AvailabilitiesService>();
builder.Services.AddScoped<IService<ChatMessagesDto>, ChatMessagesService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegisterService, RegisterService>();

//builder.Services.AddScoped<IMatchingService, MatchingService>();


builder.Services.AddScoped<HelpRequestsService>();
builder.Services.AddScoped<MatchingService>();
// ==========================
// 4️⃣ JWT Authentication
// ==========================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
            )
        };
    });

builder.Services.AddAuthorization();

// ==========================
// 5️⃣ Controllers + Swagger
// ==========================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{ }
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// ===========================================
// 🚀 אתחול מנהל מערכת (Admin Seed)
// ===========================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var usersService = services.GetRequiredService<UsersService>();
        // קריאה לפונקציה שכתבנו בסרוויס
        await usersService.CreateAdminIfNotExists();
    }
    catch (Exception ex)
    {
        // הדפסת שגיאה לקונסול אם משהו השתבש באתחול
        Console.WriteLine($"An error occurred seeding the Admin: {ex.Message}");
    }
}

// ==========================
// Middleware Pipeline
// ==========================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();