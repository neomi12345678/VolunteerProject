using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MatchingController : ControllerBase
    {
        private readonly MatchingService _matchingService;

        public MatchingController(MatchingService matchingService)
        {
            _matchingService = matchingService;
        }

        // POST /api/Matching/run
        // המנהל לוחץ על הכפתור → מריץ את האלגוריתם ומחזיר את כל השידוכים
        [HttpPost("run")]
        public async Task<IActionResult> RunMatching()
        {
            try
            {
                var results = await _matchingService.MatchAll();

                if (results.Count == 0)
                    return Ok(new { message = "No matches found for open requests.", matches = results });

                return Ok(new { message = $"{results.Count} matches created.", matches = results });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace });
            }
        }
    }
}
