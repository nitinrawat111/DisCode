## Overview
DisCode is supposed to be a site for practicing Coding Problems along with some additions like creating a custom room for practicing with a group, creating coding tests, readily available documentation for languages, private coding tests like hiring contests etc. 
This platform will be maintained by the community itself. Normal Users can solve problems and can later be promoted to  moderators who will add new problems & tests. The name DisCode is kind of inspired from Discord (which follows a similar role hierarchy).
*Due thanks to Leetcode, codeforces, Discord for inspiration*

## Requirements
In v0, we are going to keep things simple. No rooms, no custom tests, no contests.
### Functional Requirements
- User registration/login
- User Roles and their permissions:
	- normal: can view + submit problems
	- moderator: above + can add tests & problems
	- admin: above + promote someone to moderator
- User, admin and moderators can view their own or others' profiles.
- Everyone can view problems
- A Problem can have multiple **tests** 
	- Not be confused with "test cases" within a single program run. Like in those problems where input section looks like this, "*First Line contains an integer t, the number of testcases*"
	- By multiple tests we mean that we have multiple set of inputs and would run the entire program once for each input. Each input will contain the inputs as described in problem statement. Now those inputs can either correspond to single test case in the problem domain or multiple. 
- Submitting code and getting results. Executing user code safely without compromising our servers. [Isolated Environment for Executing User Code](../isolation/isolation.md)
- Users can view code submission status  ("Queued", "Compile Error", "Runtime Error", "TLE", "WA", "Successful") 
- They can also view the runtime, memory used and number of tests that passed (useful in case of "TLE" or "WA", etc.)

### Non-Functional Requirements (Just for fun, not to be considered currently)
- High availability, Low latency, High scalability
- We'll be aiming at building a highly scalable solution. So, we'll consider a hypothetical situation with high requirements. So we'll be considering **1,000,000 daily active users worldwide**
- **Average active users per hour = 1 Million / 24 = 42,000** (We can make easy assumptions on what user does within an hour. So this is kinda helpful.)
- ==Submission QPS==
	- Most costly activity will be code submission which might cause a bottleneck. So, we'll look at it first.
	- It takes around 30 minutes to solve an Leetcode Medium. So, here we'll make assumptions based on that. User solves two problems in one hour and make 2 submissions for each problems.
	- Each user makes 8 submission on average per hour (4 final submits + 4 test runs). 
	- **Average Submission Per hour = 210,000 
	- **Average Submission Per Second ~ 120
	- For Peak Submission QPS, we can consider the case of contests. Each contest contains 4 problems and lasts 2 hours. Considering 500,000 participants (50% of daily active users).
	- **Peak Submissions Per hour = 5000,000 * 8 = 4,000,000**
	- **Peak Submission per second ~ 1200 
	- Also note that contests happen once a week and thus we can save up on costs be spinning up extra resources only when required.
	- **How many Concurrent Submissions we need to execute to ensure no wait time**: Considering a submission runs for an average of 5 seconds (including setting up sandbox environments),
		 - On average = 120 x 5 = 600
		 - During peak/contest hours =  1200 x 5 = 6000
 - ==Overall QPS==
	 - We will consider that on average an user makes the following requests in an hour:
		 - Ignoring Login and registration. As they are not too frequent.
		 - Retrieving Problems List -> 3 requests
		 - Retrieving problems description -> 3 requests
		 - Submitting Code -> 8 requests
		 - Getting back results -> 8 x 4 = 20 requests
		 - Total = 34 requests
	 - **Average QPS = Average # of users per hour * 34  / 24 = 400**
	 - For Peak QPS, we can use the pattern we obtained from above analysis for submissions. At its peak, traffic is 10x the average traffic.
	 - **Peak QPS = 4000**
	$\frac{read}{write} = \frac{Non-Submissions}{Submissions} = \frac{4000 - 1200}{1200} = 3:1$

## System Design

See [here](System%20Design.excalidraw)

## DB Schemas

### User DB
```json
{
	"user_id": "id",
	"username": "string",
	"email": "string",
	"password_hash": "string",
	"role": "string", // "normal", "moderator", or "admin"
	"bio": "string",
	"avatar_url": "string",
	"created_at": "ISODate"
}
```

### Problems DB
```json
{
	"problemId": "id",
	"title": "string",
	"markdownKey": "string", // Link for problem statement markdown
	"testKeys": ["string"],
	"difficulty": "string", // "easy", "medium", "hard"
	"tags": ["string"],
	"createdBy": "userId string",
	"createdAt": "ISODate",
	"updatedAt": "ISODate",
}

```

### Submission DB
```json
{
	"submission_id": "submissionId",
	"user_id": "id",
	"problem_id": "id",

	// C++, Java, etc.
	"language": "string", 

	// "Queued", "Compile Error", "Runtime Error", "TLE", "WA", "Successful", 
	// "Server Error"
	"status": "string", 

	"runtime": "number",
	"memory_used": "number",
	"test_cases_passed": "number",
	"total_test_cases": "number",
	"error_message": "string",
	"submission_key": "string",
	"createdAt": "ISODate",
	"executedAt": "ISODate",
}
```

## Resources
https://systemdesignschool.io/problems/leetcode/solution
https://www.hellointerview.com/learn/system-design/answer-keys/leetcode
https://medium.com/wix-engineering/how-to-choose-the-right-database-for-your-service-97b1670c5632
