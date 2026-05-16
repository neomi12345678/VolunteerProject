using Repository.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class AvailabilitiesDto
    {
        public int Id { get; set; }
        public int UserID { get; set; }

        public DAY Day { get; set; }
        public TimeSpan From_Time { get; set; }
        public TimeSpan To_Time { get; set; }

    }

}
