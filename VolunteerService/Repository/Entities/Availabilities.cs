using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public enum DAY { Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday }
    public class Availabilities
    {
        public int Id { get; set; }
        [ForeignKey("Users")]
        public int UserID { get; set; }

        public DAY Day { get; set; }

        public TimeSpan From_Time { get; set; }
        public TimeSpan To_Time { get; set; }
    }
}
