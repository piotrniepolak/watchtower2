export interface ConflictUpdate {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  severity: number;
  source: string;
}

export class TimelineGenerator {
  
  static generateRecentUpdates(conflictName: string): ConflictUpdate[] {
    const updates = this.getConflictUpdates(conflictName);
    return updates.slice(0, 6);
  }

  private static getConflictUpdates(conflictName: string): ConflictUpdate[] {
    const now = new Date();
    const baseUpdates = [
      {
        title: "Diplomatic Meeting Scheduled",
        description: "Senior officials from both sides agreed to meet next week for peace negotiations.",
        severity: 3,
        hoursAgo: 2
      },
      {
        title: "Humanitarian Corridor Opened", 
        description: "A new safe passage route was established for civilian evacuations.",
        severity: 4,
        hoursAgo: 6
      },
      {
        title: "Ceasefire Violations Reported",
        description: "Multiple breaches of the temporary ceasefire were documented by international observers.",
        severity: 7,
        hoursAgo: 12
      },
      {
        title: "International Aid Delivery",
        description: "UN convoy successfully delivered medical supplies and food to affected regions.",
        severity: 2,
        hoursAgo: 18
      },
      {
        title: "Military Equipment Movement",
        description: "Satellite imagery shows significant repositioning of forces along the border.",
        severity: 6,
        hoursAgo: 24
      },
      {
        title: "Economic Sanctions Update",
        description: "New trade restrictions were imposed by the international community.",
        severity: 5,
        hoursAgo: 36
      }
    ];

    return baseUpdates.map((update, index) => ({
      id: `${conflictName}-${now.getTime()}-${index}`,
      timestamp: new Date(now.getTime() - update.hoursAgo * 60 * 60 * 1000),
      title: update.title,
      description: update.description,
      severity: update.severity,
      source: "Intelligence Reports"
    }));
  }
}