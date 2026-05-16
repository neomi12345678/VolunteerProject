using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class ChatMessagesDto
    {
        public int Id { get; set; }
        public int AssignmentID { get; set; }
        public int SenderID { get; set; }
        public string MessageContent { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
