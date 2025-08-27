export class WhatsAppChatParser {
  constructor() {
    this.messagePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM)?)\s-\s([^:]+):\s(.+)/,
      /(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.+)/
    ];
    
    this.linkedinPatterns = [
      /https?:\/\/(www\.)?linkedin\.com\/posts?\/[\w\-]+/gi,
      /https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/activity\/[\w\-]+/gi
    ];
    
    this.supportPatterns = {
      emojis: /^[👍❤️🔥💡👏🙌✨🎉💪🚀👌💯⭐]+$/,
      text: /^(nice|great|awesome|good|excellent|amazing|fantastic|love it|congrats|well done)/i
    };
  }

  parseMessage(line) {
    for (const pattern of this.messagePatterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          date: match[1],
          time: match[2],
          sender: match[3].trim(),
          message: match[4].trim(),
          timestamp: this.parseTimestamp(match[1], match[2])
        };
      }
    }
    return null;
  }

  parseTimestamp(date, time) {
    // Handle different date formats: MM/DD/YY or DD/MM/YY
    const [month, day, year] = date.split('/').map(Number);
    const fullYear = year < 50 ? 2000 + year : (year < 100 ? 1900 + year : year);
    
    // Handle time with AM/PM
    let [hours, minutes] = time.split(':').map(Number);
    if (time.toLowerCase().includes('pm') && hours !== 12) {
      hours += 12;
    } else if (time.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }
    
    return new Date(fullYear, month - 1, day, hours, minutes || 0);
  }

  extractLinkedInUrls(message) {
    const urls = [];
    this.linkedinPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) urls.push(...matches);
    });
    return urls;
  }

  isSupportMessage(content) {
    const trimmed = content.trim();
    return this.supportPatterns.emojis.test(trimmed) || 
           this.supportPatterns.text.test(trimmed);
  }

  matchMemberName(senderName, members) {
    const normalized = senderName.toLowerCase().trim();
    
    // Try exact name match first
    let match = members.find(member => 
      member.name.toLowerCase() === normalized
    );
    
    if (match) return match;
    
    // Try partial name match
    match = members.find(member => {
      const memberNames = member.name.toLowerCase().split(' ');
      return memberNames.some(name => normalized.includes(name) || name.includes(normalized));
    });
    
    return match;
  }

  async parseChat(chatContent, members) {
    const lines = chatContent.split('\n');
    const messages = [];
    const linkedinPosts = [];
    const supportActions = [];
    
    let currentMessage = null;
    let recentPosts = []; // Track recent posts for support matching
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const parsedMessage = this.parseMessage(trimmed);
      
      if (parsedMessage) {
        currentMessage = parsedMessage;
        messages.push(parsedMessage);
        
        const member = this.matchMemberName(parsedMessage.sender, members);
        if (member) {
          parsedMessage.memberId = member.id;
        }
        
        // Check for LinkedIn URLs
        const urls = this.extractLinkedInUrls(parsedMessage.message);
        if (urls.length > 0 && member) {
          for (const url of urls) {
            const post = {
              memberId: member.id,
              memberName: member.name,
              url,
              sharedAt: parsedMessage.timestamp,
              reactions: []
            };
            linkedinPosts.push(post);
            recentPosts.push({ ...post, messageIndex: messages.length - 1 });
          }
        }
        
        // Check if this is support for a recent post
        if (this.isSupportMessage(parsedMessage.message) && member) {
          // Find the most recent LinkedIn post (within last 50 messages)
          const recentPostsInRange = recentPosts.filter(post => 
            messages.length - post.messageIndex <= 50
          );
          
          if (recentPostsInRange.length > 0) {
            const mostRecentPost = recentPostsInRange[recentPostsInRange.length - 1];
            supportActions.push({
              postUrl: mostRecentPost.url,
              postAuthorId: mostRecentPost.memberId,
              supporterId: member.id,
              supporterName: member.name,
              reactionType: parsedMessage.message,
              reactedAt: parsedMessage.timestamp
            });
            
            // Add to the post's reactions
            const linkedinPost = linkedinPosts.find(p => p.url === mostRecentPost.url);
            if (linkedinPost) {
              linkedinPost.reactions.push({
                memberId: member.id,
                memberName: member.name,
                reaction: parsedMessage.message,
                timestamp: parsedMessage.timestamp
              });
            }
          }
        }
      } else if (currentMessage) {
        // Multi-line message continuation
        currentMessage.message += '\n' + trimmed;
      }
    }
    
    return {
      totalMessages: messages.length,
      linkedinPosts,
      supportActions,
      messages,
      summary: {
        totalMembers: new Set(messages.map(m => m.memberId).filter(Boolean)).size,
        membersPosted: new Set(linkedinPosts.map(p => p.memberId)).size,
        totalPosts: linkedinPosts.length,
        totalSupport: supportActions.length
      }
    };
  }
}