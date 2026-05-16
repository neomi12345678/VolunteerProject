using Repository.Entities;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Repository.Interfaces
{
    public interface IContext
    {
        public DbSet<Users> Users { get; set; }
        public DbSet<HelpRequests> HelpRequests { get; set; }
        public DbSet<Assignments> Assignments { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<ChatMessages> ChatMessages { get; set; }
        public DbSet<Availabilities> Availabilities { get; set; }
        public DbSet<UserAvailabilities> UserAvailabilities { get; set; }
        public DbSet<UserCategories> UserCategories { get; set; }

        Task SaveAsync();
    }
}
