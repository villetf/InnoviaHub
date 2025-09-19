using System;
using backend.Models.Entities;

namespace backend.Models;

// Joel's ändringar för rätt userinfo - Lade till UserName för att visa användarnamn istället för GUID
public class Booking
{
   public int Id { get; set; }
   public required Guid UserId { get; set; } // Azure AD Object ID (oid)
   public string? UserName { get; set; } // Joel's ändringar: User's display name from Azure AD
   public required int ResourceId { get; set; }
   public Resource? Resource { get; set; }
   public required DateTime StartTime { get; set; }
   public required DateTime EndTime { get; set; }
   public required string Status { get; set; }
   public DateTime CreatedAt { get; set; } = DateTime.Now;
}
