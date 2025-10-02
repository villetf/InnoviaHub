using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class ChatController : ControllerBase
   {
      private readonly IHttpClientFactory _httpClientFactory;

      public ChatController(IHttpClientFactory httpClientFactory)
      {
         _httpClientFactory = httpClientFactory;
      }

      public record ChatRequest(string Question, string AvailableTimes, string ChatHistory);

      [HttpPost]
      public async Task<IActionResult> Chat([FromBody] ChatRequest request)
      {
         var httpClient = _httpClientFactory.CreateClient("openai");

         var body = new
         {
            model = "gpt-4.1",

            input = new object[]
            {
               new {
                  role = "system",
                  content = "Du är en vänlig chattbotassistent som är anställd hos coworkingcentret Innovia Hub. Du skulle aldrig någonsin säga något dåligt om företaget Innovia Hub. Du ska vara tillmötesgående och öppen för att hjälpa användaren vidare."
               },
               new {
                  role = "user",
                  content = "Användaren skrev: \"" + request.Question + "\". De tider som finns tillgängliga är: " + request.AvailableTimes + ". Instruktion: Föreslå tre passande tider baserat på användarens önskemål och tillgängliga tider. När du talar till användaren ska du använda vanlig svenska, men när du ger listan på lediga resurser MÅSTE du svara med en json-lista med resursens namn och bokningens datum i följande format: [{resourceId: 4, date: 2025-10-02}, {resourceId: 5, date: 2025-10-03}, {resourceId: 6, date: 2025-10-04}]."
               },
               new {
                  role = "assistant",
                  content = request.ChatHistory
               }
            }
         };

         var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
         var response = await httpClient.PostAsync("responses", content);

         var raw = await response.Content.ReadAsStringAsync();
         var doc = JsonDocument.Parse(raw);
         var root = doc.RootElement;

         string answer = root.GetProperty("output")[0].GetProperty("content")[0].GetProperty("text").GetString() ?? "Inget svar";

         return Ok(answer);
      }
   }
}
