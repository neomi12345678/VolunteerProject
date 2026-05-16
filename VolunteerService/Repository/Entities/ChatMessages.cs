using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class ChatMessages
    {
        public int Id { get; set; }

        [ForeignKey("Assignments")]
        public int AssignmentID { get; set; }

        [ForeignKey("Users")]
        public int SenderID { get; set; }

        public string MessageContent { get; set; }

        public DateTime Timestamp { get; set; }
    }
}
