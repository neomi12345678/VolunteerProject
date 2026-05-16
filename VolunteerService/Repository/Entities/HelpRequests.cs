using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public enum HelpRequestStatus
    {
        Open,       // הבקשה פתוחה, מחכה לשיבוץ
        Matched,    // הבקשה כבר משובצת למתנדב
        Completed,  // הבקשה הושלמה
        Cancelled   // הבקשה בוטלה
    }
    public class HelpRequests
    {
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int NeedyID { get; set; }

        [ForeignKey("Categories")]
        public int CategoryID { get; set; }

        public string Description { get; set; }

        public HelpRequestStatus Status { get; set; } // "Open" / "Matched" / "Completed"

        public DateTime CreatedAt { get; set; }

        
        [Required]
        public Availabilities Availability { get; set; }
    }
}
