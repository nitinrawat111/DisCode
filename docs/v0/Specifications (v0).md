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
- Submitting code and getting results. Executing user code safely without compromising our servers. [[Isolated Environment for Executing User Code]]
- Users can view code submission status  ("Queued", "Compile Error", "Runtime Error", "TLE", "WA", "Successful") 
- They can also view the runtime, memory used and number of tests that passed (useful in case of "TLE" or "WA", etc.)

### Non-Functional Requirements
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

![[System Design]]

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

## DB choices
### User DB
- Read:Write
	For 1 Million daily users, let's make an assumption that 10,000 new user register each day.
	So read-write ratio is > 100:1
- Structured data
- Strong consistency. Writes should be reflected instantly. (User should be able to login just after registration)
- Requires Isolation: Multiple moderators might be changing role of a single user
- High availability & low latency & high durability 
- PostgreSQL ✔
### Problems DB
- Read:Write
	Consider a problem is created and then 100 test cases were added. Lets assume this problem will be read on an average of 100,000 times. So read-write ratio is pretty huge. Greater than 1000:1
- Structured Data
- High availability and low latency
- Need isolation. (multiple moderators might be updating tests for same problem )
- Might also need text search capabilities.
- ScyllaDB ❌ (Resource Intensive. We also need to deploy  and we have no money :) )
- MongoDB ✔ (Difficult to imeplement transaction isolation)
- SQL DBs ✔ (Difficult to implement text search)
### Submission DB
- Read:Write
	On average, each submission will be accessed 10 times. 5 times for checking the results after submission (client periodically checks submission status) and around 5 times for additonal reads. So, read-write ratio is something around 10:1
- Structured Data
- Strong consistency. Writes should be reflected instantly (Since submission status is checked frequently after submission).
- High availability and low latency and high durability (user submits, DB goes down, the submission should still be there in DB)
- PostgreSQL ✔

## Service Responsibilities
### User Service
- Add a new user
- Login user
- Get user details
- Provide public jwt keys for jwt verification
## Resources
https://systemdesignschool.io/problems/leetcode/solution
https://www.hellointerview.com/learn/system-design/answer-keys/leetcode
https://medium.com/wix-engineering/how-to-choose-the-right-database-for-your-service-97b1670c5632










