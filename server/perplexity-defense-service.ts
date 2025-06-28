private applyFormattingRules(text: string): string {
    // ✂ EXCESSIVE FULL STOPS - Collapse choppy fragments
    text = text.replace(/(\w)\.\s+(\w)/g, (match, before, after) => {
      // Keep U.S., U.K., etc.
      if (before.match(/[A-Z]/) && after.match(/[A-Z]/)) {
        return match;
      }
      // Collapse other cases
      return `${before} ${after}`;
    });

    // ❌ ELLIPSIS BAN - Remove all ellipses
    text = text.replace(/\s*\.\.\.\s*/g, ' ');
    text = text.replace(/\s*…\s*/g, ' ');

    // Remove formatting symbols
    text = text.replace(/\*\*/g, '');
    text = text.replace(/\*/g, '');
    text = text.replace(/__/g, '');
    text = text.replace(/_/g, '');
    text = text.replace(/#{1,6}\s/g, '');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/`([^`]+)`/g, '$1');

    // Clean up multiple spaces
    text = text.replace(/\s+/g, ' ');

    // Ensure proper sentence endings
    text = text.replace(/([.!?])\s*([A-Z])/g, '$1 $2');

    return text.trim();
  }

  private cleanBulletPoint(bullet: string): string {
    // Remove formatting symbols
    bullet = bullet.replace(/^\s*[-*•]\s*/, '');
    bullet = this.applyFormattingRules(bullet);

    // Ensure single period at end
    bullet = bullet.replace(/[.!?]+$/, '');
    bullet = bullet + '.';

    return bullet;
  }