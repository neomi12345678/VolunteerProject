using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class AssignmentsDto
    {
        public int Id { get; set; }
        public int VolunteerID { get; set; }
        public int HelpRequestID { get; set; }
        public DateTime AssignedAt { get; set; }
        public AssignmentStatus Status { get; set; }
    }

}
