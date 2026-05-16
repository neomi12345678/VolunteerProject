using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public enum AssignmentStatus
    {
        Active,     // משימה פעילה
        Finished,   // משימה שהושלמה
        Cancelled   // משימה בוטלה
    }
    public class Assignments
    {
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int VolunteerID { get; set; }

        [ForeignKey("HelpRequests")]
        public int HelpRequestID { get; set; }

        public DateTime AssignedAt { get; set; }

        public AssignmentStatus Status { get; set; } // "Active" / "Finished" / "Cancelled"

    }
}
