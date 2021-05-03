CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    auther VARCHAR(255),
    publisher VARCHAR(255),
    publishedDate VARCHAR(255),
    imageLinks VARCHAR(255),
    canonicalVolumeLink VARCHAR(255)
);

INSERT  INTO books (title,auther,publisher,publishedDate,imageLinks,canonicalVolumeLink) VALUES
 ('aboutme','ahamd','ahmad','2020','imgage.com','ddnjnj.com');