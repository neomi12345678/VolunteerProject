using Newtonsoft.Json;
using System.Text;

// שירות לתקשורת עם מודל ה-AI החיצוני (Python FastAPI שרץ לוקאלית)
// אחראי על סיווג טקסט של בקשת עזרה לקטגוריה מתאימה
public class AIService
{
    // HttpClient סטטי — נוצר פעם אחת לכל חיי האפליקציה כדי למנוע בזבוז משאבים (Socket exhaustion)
    private static readonly HttpClient _client = new HttpClient();

    // מקבלת טקסט חופשי של בקשת עזרה ומחזירה קטגוריה, אייקון וסטטוס
    // מוחזרים כ-Tuple כדי לאפשר קריאה נוחה ללא יצירת DTO נפרד
    public async Task<(string category, string icon, string status)> GetCategoryFromAI(string requestText)
    {
        // עטיפת הטקסט באובייקט JSON שה-API מצפה לו: { "text": "..." }
        var data = new { text = requestText };
        var json = JsonConvert.SerializeObject(data);

        // קידוד התוכן כ-UTF8 עם Content-Type: application/json
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // שליחת POST לשרת Python המקומי — endpoint של סיווג
        var response = await _client.PostAsync("http://127.0.0.1:8000/classify", content);

        // קריאת התשובה כטקסט גולמי
        var result = await response.Content.ReadAsStringAsync();

        // פירוק ה-JSON לאובייקט דינמי — מאפשר גישה לשדות ללא הגדרת מחלקה מקבלת
        dynamic obj = JsonConvert.DeserializeObject(result);

        // הוצאת שלושת השדות מהתשובה והחזרתם כ-Tuple
        return (
            (string)obj.category,
            (string)obj.icon,
            (string)obj.status
        );
    }
}




