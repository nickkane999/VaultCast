import { Container, Typography, Card, CardContent, Rating, Box, Chip, Button, Avatar, Stack } from "@mui/material";
import { ArrowBack, AccessTime, Star, Language, Business } from "@mui/icons-material";
import Link from "next/link";
import VideoPlayer from "@/lib/components/VideoPlayer";
import TrailerButton from "@/lib/components/TrailerButton";

async function getVideoRecord(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    // Try movies first
    let response = await fetch(`${baseUrl}/api/videos/movies/${id}`, {
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      return { ...data, type: "movie" };
    }

    // If not found in movies, try TV shows
    response = await fetch(`${baseUrl}/api/videos/tv/${id}`, {
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      return { ...data, type: "tv" };
    }

    return null;
  } catch (error) {
    console.error("Error fetching video record:", error);
    return null;
  }
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const videoRecord = await getVideoRecord(id);

  if (!videoRecord) {
    return (
      <Container sx={{ py: 4 }}>
        <Link href="/videos" passHref>
          <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
            Back to Videos
          </Button>
        </Link>
        <Typography variant="h4" gutterBottom>
          Video Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The requested video could not be found.
        </Typography>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getYear = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return null;
    }
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Link href="/videos" passHref>
        <Button startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Back to Videos
        </Button>
      </Link>

      <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
        <Box sx={{ flex: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              {videoRecord.title}
            </Typography>

            {videoRecord.type === "tv" && (
              <Typography variant="h5" sx={{ color: "text.secondary", mb: 1 }}>
                {videoRecord.show_name} - Season {videoRecord.season_number}, Episode {videoRecord.episode_number}
              </Typography>
            )}

            {videoRecord.tagline && (
              <Typography variant="h6" sx={{ fontStyle: "italic", color: "text.secondary", mb: 2 }}>
                "{videoRecord.tagline}"
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {videoRecord.score !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={videoRecord.score} readOnly max={10} />
                  <Typography variant="body1" fontWeight="bold">
                    {videoRecord.score}/10
                  </Typography>
                </Box>
              )}

              {videoRecord.vote_average && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Star color="primary" />
                  <Typography variant="body1">
                    {videoRecord.vote_average}/10 TMDb ({videoRecord.vote_count} votes)
                  </Typography>
                </Box>
              )}

              {videoRecord.type === "movie" && videoRecord.release_date && <Chip label={getYear(videoRecord.release_date)} color="primary" variant="outlined" />}
              {videoRecord.type === "tv" && videoRecord.air_date && <Chip label={getYear(videoRecord.air_date)} color="primary" variant="outlined" />}

              {videoRecord.runtime && <Chip icon={<AccessTime />} label={formatRuntime(videoRecord.runtime)} variant="outlined" />}

              {videoRecord.status && videoRecord.status !== "Released" && <Chip label={videoRecord.status} color="secondary" variant="outlined" />}
            </Box>

            {videoRecord.type === "movie" && videoRecord.release_date && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Released: {formatDate(videoRecord.release_date)}
              </Typography>
            )}

            {videoRecord.type === "tv" && videoRecord.air_date && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Aired: {formatDate(videoRecord.air_date)}
              </Typography>
            )}

            {videoRecord.genres && videoRecord.genres.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Genres
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {videoRecord.genres.map((genre: string, index: number) => (
                    <Chip key={index} label={genre} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {videoRecord.trailer_url && (
              <Box sx={{ mb: 3 }}>
                <TrailerButton trailerUrl={videoRecord.trailer_url} />
              </Box>
            )}
          </Box>

          <VideoPlayer filename={videoRecord.filename} videoType={videoRecord.type} />

          {videoRecord.description && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {videoRecord.description}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: { md: "300px" } }}>
          {videoRecord.cast && videoRecord.cast.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cast
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {videoRecord.cast.slice(0, 10).map((actor: any, index: number) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar src={actor.profile_path ? `https://image.tmdb.org/t/p/w92${actor.profile_path}` : undefined} sx={{ mr: 2, width: 40, height: 40 }}>
                        {actor.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {actor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {actor.character}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {(videoRecord.production_companies?.length > 0 || videoRecord.production_countries?.length > 0 || videoRecord.spoken_languages?.length > 0) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Production Details
                </Typography>

                {videoRecord.production_companies && videoRecord.production_companies.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Business fontSize="small" />
                      Production Companies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {videoRecord.production_companies.join(", ")}
                    </Typography>
                  </Box>
                )}

                {videoRecord.production_countries && videoRecord.production_countries.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Countries
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {videoRecord.production_countries.join(", ")}
                    </Typography>
                  </Box>
                )}

                {videoRecord.spoken_languages && videoRecord.spoken_languages.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Language fontSize="small" />
                      Languages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {videoRecord.spoken_languages.join(", ")}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {videoRecord.keywords && videoRecord.keywords.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Keywords
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {videoRecord.keywords.map((keyword: string, index: number) => (
                    <Chip key={index} label={keyword} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 4, color: "text.secondary", fontSize: "0.875rem" }}>
        <Typography variant="caption">File: {videoRecord.filename}</Typography>
        {videoRecord.tmdb_id && (
          <Typography variant="caption" sx={{ ml: 2 }}>
            TMDb ID: {videoRecord.tmdb_id}
          </Typography>
        )}
        {videoRecord.imdb_id && (
          <Typography variant="caption" sx={{ ml: 2 }}>
            IMDb ID: {videoRecord.imdb_id}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
