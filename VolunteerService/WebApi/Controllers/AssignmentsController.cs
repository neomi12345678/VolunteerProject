using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using Service.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly IService<AssignmentsDto> _service;
        private readonly IService<UsersDto> _usersService;
        private readonly IService<HelpRequestsDto> _helpRequestsService;
        private readonly IRepository<Assignments> _assignmentsRepository;
        private readonly IRepository<HelpRequests> _helpRequestsRepository;

        public AssignmentsController(
            IService<AssignmentsDto> service,
            IService<UsersDto> usersService,
            IService<HelpRequestsDto> helpRequestsService,
            IRepository<Assignments> assignmentsRepository,
            IRepository<HelpRequests> helpRequestsRepository)
        {
            _service = service;
            _usersService = usersService;
            _helpRequestsService = helpRequestsService;
            _assignmentsRepository = assignmentsRepository;
            _helpRequestsRepository = helpRequestsRepository;
        }

        [HttpGet]
        public async Task<List<AssignmentsDto>> Get()
            => await _service.GetAll();

        [HttpGet("{id}")]
        public async Task<AssignmentsDto> Get(int id)
            => await _service.GetById(id);

        [HttpPost]
        public async Task<AssignmentsDto> Post([FromBody] AssignmentsDto value)
            => await _service.AddItem(value);

        // PUT api/assignments/{id} — עדכון רגיל (ללא לוגיקת סטטוס)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] AssignmentsDto value)
        {
            await _service.UpdateItem(id, value);
            return Ok();
        }

        // ─────────────────────────────────────────────────────────────────
        // PUT api/assignments/{id}/status  ← החדש!
        // כללי סטטוס:
        //   Active  → Finished : בקשה → Completed, מתנדב משוחרר   ✅
        //   Active  → Cancelled: Assignment נמחק, בקשה → Open      ✅
        //   Active  → Active   : חסום ❌
        //   Finished → כל דבר : חסום ❌
        // ─────────────────────────────────────────────────────────────────
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            var existing = await _assignmentsRepository.GetById(id);
            if (existing == null)
                return NotFound(new { message = $"Assignment {id} not found." });

            // Finished — נעול לתמיד
            if (existing.Status == AssignmentStatus.Finished)
                return BadRequest(new { message = "Assignment is already completed and cannot be changed." });

            // חסימת חזרה ל-Active
            if (req.Status == AssignmentStatus.Active)
                return BadRequest(new { message = "Cannot revert a matched assignment back to Active." });

            var helpRequest = await _helpRequestsRepository.GetById(existing.HelpRequestID);

            // Active → Finished: סגירה סופית
            if (req.Status == AssignmentStatus.Finished)
            {
                existing.Status = AssignmentStatus.Finished;
                await _assignmentsRepository.UpdateItem(id, existing);

                if (helpRequest != null)
                {
                    helpRequest.Status = HelpRequestStatus.Completed;
                    await _helpRequestsRepository.UpdateItem(helpRequest.Id, helpRequest);
                }

                return Ok(new { message = "Assignment completed. Volunteer is now free." });
            }

            // Active → Cancelled: מחיקה + בקשה חוזרת ל-Open
            if (req.Status == AssignmentStatus.Cancelled)
            {
                await _assignmentsRepository.DeleteItem(id);

                if (helpRequest != null)
                {
                    helpRequest.Status = HelpRequestStatus.Open;
                    await _helpRequestsRepository.UpdateItem(helpRequest.Id, helpRequest);
                }

                return Ok(new { message = "Assignment cancelled. Help request is Open again." });
            }

            return BadRequest(new { message = "Invalid status transition." });
        }

        // DELETE api/assignments/{id}
        [HttpDelete("{id}")]
        public async Task Delete(int id)
            => await _service.DeleteItem(id);

        [HttpGet("volunteer/{volunteerId}/helped-count")]
        //לכמה אנשים המתנדב סיים לסייע
        public async Task<ActionResult<int>> GetHelpedCount(int volunteerId)
        {
            var all = await _assignmentsRepository.GetAll();
            var count = all.Count(a =>
                a.VolunteerID == volunteerId &&
                a.Status == AssignmentStatus.Finished);
            return Ok(count);
        }

        [HttpGet("volunteer/{volunteerId}/active")]
        public async Task<ActionResult<List<AssignmentEnrichedDto>>> GetActiveByVolunteer(int volunteerId)
        {
            var all = await _assignmentsRepository.GetAll();
            var active = all
                .Where(a => a.VolunteerID == volunteerId && a.Status == AssignmentStatus.Active)
                .ToList();

            var result = new List<AssignmentEnrichedDto>();
            foreach (var a in active)
            {
                HelpRequestsDto? helpRequest = null;
                try { helpRequest = await _helpRequestsService.GetById(a.HelpRequestID); } catch { }

                UsersDto? requester = null;
                if (helpRequest != null)
                    try { requester = await _usersService.GetById(helpRequest.NeedyID); } catch { }

                result.Add(new AssignmentEnrichedDto
                {
                    Id = a.Id,
                    VolunteerID = a.VolunteerID,
                    HelpRequestID = a.HelpRequestID,
                    AssignedAt = a.AssignedAt,
                    Status = a.Status.ToString(),
                    HelpRequestTitle = helpRequest?.Description,
                    RequesterName = requester?.FullName,
                    RequesterCity = requester?.City,
                });
            }
            return Ok(result);
        }

        [HttpGet("needy/{needyId}/active")]
        public async Task<ActionResult<List<AssignmentEnrichedDto>>> GetActiveByNeedy(int needyId)
        {
            var allRequests = await _helpRequestsService.GetAll();
            var needyRequestIds = allRequests
                .Where(r => r.NeedyID == needyId)
                .Select(r => r.Id)
                .ToHashSet();

            if (!needyRequestIds.Any())
                return Ok(new List<AssignmentEnrichedDto>());

            var all = await _assignmentsRepository.GetAll();
            var active = all
                .Where(a => needyRequestIds.Contains(a.HelpRequestID) && a.Status == AssignmentStatus.Active)
                .ToList();

            var result = new List<AssignmentEnrichedDto>();
            foreach (var a in active)
            {
                HelpRequestsDto? helpRequest = null;
                try { helpRequest = await _helpRequestsService.GetById(a.HelpRequestID); } catch { }

                UsersDto? volunteer = null;
                try { volunteer = await _usersService.GetById(a.VolunteerID); } catch { }

                result.Add(new AssignmentEnrichedDto
                {
                    Id = a.Id,
                    VolunteerID = a.VolunteerID,
                    HelpRequestID = a.HelpRequestID,
                    AssignedAt = a.AssignedAt,
                    Status = a.Status.ToString(),
                    HelpRequestTitle = helpRequest?.Description,
                    VolunteerName = volunteer?.FullName,
                });
            }
            return Ok(result);
        }
    }

    public class UpdateStatusRequest
    {
        public AssignmentStatus Status { get; set; }
    }

    public class AssignmentEnrichedDto
    {
        public int Id { get; set; }
        public int VolunteerID { get; set; }
        public int HelpRequestID { get; set; }
        public DateTime AssignedAt { get; set; }
        public string? Status { get; set; }
        public string? HelpRequestTitle { get; set; }
        public string? RequesterName { get; set; }
        public string? RequesterCity { get; set; }
        public string? VolunteerName { get; set; }
    }
}
