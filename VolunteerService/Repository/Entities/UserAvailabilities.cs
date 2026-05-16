using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repository.Entities;

namespace Repository.Entities
{
    public class UserAvailabilities
    {
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int UserID { get; set; }

        [ForeignKey("Availabilities")]
        public int AvailabilityID { get; set; }
        public Availabilities Availability { get; set; }
    }
}
