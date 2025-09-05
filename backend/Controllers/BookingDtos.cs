namespace backend.Controllers;


public record BookingCreateDto(Guid UserId, int ResourceId, DateTime StartTime, DateTime EndTime, string Status);
public record BookingUpdateDto(Guid UserId, int ResourceId, DateTime StartTime, DateTime EndTime, string Status);
public record BookingReadDto(int Id, Guid UserId, int ResourceId, string ResourceName, DateTime StartTime, DateTime EndTime, string Status, DateTime CreatedAt);
