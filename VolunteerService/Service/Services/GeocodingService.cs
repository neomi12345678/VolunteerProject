using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Service.Helpers
{
    // שירות סטטי לגיאוקודינג — המרת כתובת טקסטואלית לקואורדינטות GPS (lat/lon)
    //-Nominatim — API פתוח של OpenStreetMap,
    public static class GeocodingService
    {
        // מקבלת רחוב ועיר ומחזירה קואורדינטות גיאוגרפיות (latitude, longitude)
        public static async Task<(double lat, double lon)> GetCoordinates(string street, string city)
        {
            // יוצר HttpClient חדש בכל קריאה (הפוך מ-AIService) — כאן זה בסדר כי קריאות הן נדירות (רק בהרשמה)
            // User-Agent חובה עבור Nominatim — בלעדיו הבקשה נדחית
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("User-Agent", "MyVolunteerApp");

                // בניית כתובת מלאה — הוספת "Israel" מגביל את החיפוש לישראל ומשפר דיוק
                string address = $"{street}, {city}, Israel";

                // בניית URL: EscapeDataString מקודד תווים מיוחדים (רווחים, פסיקים וכו')
                // limit=1 — מספיק תוצאה אחת, הכי מתאימה
                string url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";

                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode) return (0, 0);

                var json = await response.Content.ReadAsStringAsync();
                var data = JArray.Parse(json);

                // אם נמצאה לפחות תוצאה אחת — שולפים lat/lon מהאיבר הראשון (הכי רלוונטי)
                if (data.Count > 0)
                {
                    double lat = double.Parse(data[0]["lat"].ToString());
                    double lon = double.Parse(data[0]["lon"].ToString());
                    return (lat, lon);
                }
            }
            return (0, 0);
        }
    }
}
