using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Repository.Entities;
using Repository.Interfaces;
using Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CodeFirst.Models
{
    public class AppDbContext : DbContext,IContext
    {
        private readonly IConfiguration _configuration;
        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration) : base(options)
        {
            _configuration = configuration;
        }

        public DbSet<Users> Users{ get ; set; }
        public DbSet<HelpRequests> HelpRequests{ get ; set ; }
        public DbSet<Assignments> Assignments { get; set ; }
        public DbSet<Categories> Categories { get ; set ; }
        public DbSet<ChatMessages> ChatMessages { get ; set ; }
        public DbSet<Availabilities> Availabilities { get ; set ; }
        public DbSet<UserAvailabilities> UserAvailabilities { get; set; }

        public DbSet<UserCategories> UserCategories { get; set; }

        public async Task SaveAsync()
        {
            await SaveChangesAsync();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }
    }
}
