using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class HelpRequestsDto
    {
        public int Id { get; set; }
        public int NeedyID { get; set; }  // ניתן להשאיר את זה כדי לקשר
        public int CategoryID { get; set; }
        public string Description { get; set; }
        public HelpRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public Availabilities Availability { get; set; }
    }
}
